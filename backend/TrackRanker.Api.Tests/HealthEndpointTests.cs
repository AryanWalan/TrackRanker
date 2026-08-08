using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TrackRanker.Api.Contracts;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("Environment", "Development");
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<IHostedService>();
                services.RemoveAll<ILoggerProvider>();
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsHealthyApplicationResponse()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await _client.GetAsync("/api/health", cancellationToken);
        var health = await response.Content.ReadFromJsonAsync<HealthResponse>(
            cancellationToken: cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(health);
        Assert.Equal("TrackRanker.Api", health.Application);
        Assert.Equal("Healthy", health.Status);
    }
}
