using System.Net;
using System.Net.Http.Json;
using System.Reflection;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Controllers;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;
using TrackRanker.Api.Security;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class RateLimitingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RateLimitingEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ApiPolicy_AllowsRequestsBelowLimitThenReturnsSafe429()
    {
        using var factory = CreateFactory(apiPermitLimit: 2, writePermitLimit: 2);
        using var client = factory.CreateClient();

        var first = await client.GetAsync(
            "/api/training-sessions",
            TestContext.Current.CancellationToken);
        var second = await client.GetAsync(
            "/api/training-sessions",
            TestContext.Current.CancellationToken);
        var rejected = await client.GetAsync(
            "/api/training-sessions",
            TestContext.Current.CancellationToken);
        var body = await rejected.Content.ReadFromJsonAsync<RateLimitError>(
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
        Assert.NotEqual(HttpStatusCode.InternalServerError, rejected.StatusCode);
        Assert.Equal("Too many requests. Please try again shortly.", body?.Error);
        Assert.True(rejected.Headers.RetryAfter is not null);
    }

    [Fact]
    public async Task WritePolicy_IsStricterAndDoesNotBypassDtoValidation()
    {
        using var factory = CreateFactory(apiPermitLimit: 5, writePermitLimit: 2);
        using var client = factory.CreateClient();
        var invalidRequest = new CreateTrainingSessionRequest
        {
            SessionType = Models.SessionType.Tempo,
            SessionDate = new DateOnly(2026, 8, 8),
            Prescription = "   ",
            IntendedIntensity = 70
        };

        var first = await client.PostAsJsonAsync(
            "/api/training-sessions",
            invalidRequest,
            TestContext.Current.CancellationToken);
        var second = await client.PostAsJsonAsync(
            "/api/training-sessions",
            invalidRequest,
            TestContext.Current.CancellationToken);
        var rejected = await client.PostAsJsonAsync(
            "/api/training-sessions",
            invalidRequest,
            TestContext.Current.CancellationToken);
        var readAfterWriteLimit = await client.GetAsync(
            "/api/training-sessions",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
        Assert.Equal(HttpStatusCode.OK, readAfterWriteLimit.StatusCode);
    }

    [Fact]
    public async Task HealthEndpoint_IsExemptFromApiRateLimiting()
    {
        using var factory = CreateFactory(apiPermitLimit: 1, writePermitLimit: 1);
        using var client = factory.CreateClient();

        for (var requestNumber = 0; requestNumber < 3; requestNumber++)
        {
            var response = await client.GetAsync(
                "/api/health",
                TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task DisabledE2eReset_RemainsGuardedAndExemptFromPublicPolicies()
    {
        using var factory = CreateFactory(apiPermitLimit: 1, writePermitLimit: 1);
        using var client = factory.CreateClient();

        for (var requestNumber = 0; requestNumber < 3; requestNumber++)
        {
            var response = await client.PostAsync(
                "/api/testing/reset",
                content: null,
                TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }

    [Fact]
    public void DefaultConfiguration_RegistersAWriteLimitStricterThanApiLimit()
    {
        using var factory = CreateFactory();
        var options = factory.Services
            .GetRequiredService<IOptions<ApiRateLimitingOptions>>()
            .Value;

        Assert.Equal(120, options.ApiPermitLimit);
        Assert.Equal(30, options.WritePermitLimit);
        Assert.Equal(60, options.WindowSeconds);
        Assert.True(options.WritePermitLimit < options.ApiPermitLimit);
    }

    [Theory]
    [InlineData(typeof(TrainingSessionsController), nameof(TrainingSessionsController.Create))]
    [InlineData(typeof(TrainingSessionsController), nameof(TrainingSessionsController.Update))]
    [InlineData(typeof(TrainingSessionsController), nameof(TrainingSessionsController.Delete))]
    [InlineData(typeof(SessionCompletionsController), nameof(SessionCompletionsController.Create))]
    [InlineData(typeof(SessionCompletionsController), nameof(SessionCompletionsController.Update))]
    [InlineData(typeof(SessionCompletionsController), nameof(SessionCompletionsController.Delete))]
    public void StateChangingEndpoints_UseWritePolicy(Type controllerType, string actionName)
    {
        var action = controllerType.GetMethod(actionName);
        var attribute = action?.GetCustomAttribute<EnableRateLimitingAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal(RateLimitPolicyNames.Write, attribute.PolicyName);
    }

    private WebApplicationFactory<Program> CreateFactory(
        int apiPermitLimit = 120,
        int writePermitLimit = 30)
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Environment", "Development");
            builder.UseSetting("RateLimiting:ApiPermitLimit", apiPermitLimit.ToString());
            builder.UseSetting("RateLimiting:WritePermitLimit", writePermitLimit.ToString());
            builder.UseSetting("RateLimiting:WindowSeconds", "60");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IHostedService>();
                services.RemoveAll<ILoggerProvider>();
                services.RemoveAll<ITrainingSessionService>();
                services.AddSingleton<ITrainingSessionService, EmptyTrainingSessionService>();
            });
        });
    }

    private sealed record RateLimitError(string Error);

    private sealed class EmptyTrainingSessionService : ITrainingSessionService
    {
        public Task<IReadOnlyList<TrainingSessionResponse>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrainingSessionResponse>>([]);
        }

        public Task<TrainingSessionResponse?> GetByIdAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<TrainingSessionResponse?>(null);
        }

        public Task<TrainingSessionResponse> CreateAsync(
            CreateTrainingSessionRequest request,
            CancellationToken cancellationToken = default)
        {
            throw new InvalidOperationException("DTO validation should run before the service.");
        }

        public Task<TrainingSessionResponse?> UpdateAsync(
            string id,
            UpdateTrainingSessionRequest request,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }

        public Task<bool> DeleteAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }
    }
}
