using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class TestingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public TestingEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ResetEndpoint_WhenE2eModeIsDisabled_IsUnavailable()
    {
        var service = new RecordingResetService();
        using var client = CreateClient(enabled: false, service);

        var response = await client.PostAsync(
            "/api/testing/reset",
            content: null,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0, service.CallCount);
    }

    [Fact]
    public async Task ResetEndpoint_WhenE2eModeIsExplicitlyEnabled_ResetsData()
    {
        var service = new RecordingResetService();
        using var client = CreateClient(enabled: true, service);

        var response = await client.PostAsync(
            "/api/testing/reset",
            content: null,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(1, service.CallCount);
    }

    private HttpClient CreateClient(
        bool enabled,
        RecordingResetService service)
    {
        return _factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Environment", "Development");
            builder.UseSetting("E2E:Enabled", enabled.ToString());
            builder.UseSetting("MongoDb:DatabaseName", "trackranker_e2e");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<ILoggerProvider>();
                services.RemoveAll<IE2eDataResetService>();
                services.AddSingleton<IE2eDataResetService>(service);
            });
        }).CreateClient();
    }

    private sealed class RecordingResetService : IE2eDataResetService
    {
        public int CallCount { get; private set; }

        public Task ResetAsync(CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.CompletedTask;
        }
    }
}
