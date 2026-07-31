using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Controllers;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class TestingControllerTests
{
    [Fact]
    public async Task Reset_WhenE2eModeIsDisabled_ReturnsNotFoundWithoutResetting()
    {
        var service = new RecordingResetService();
        var controller = CreateController(enabled: false, service);

        var result = await controller.Reset(TestContext.Current.CancellationToken);

        Assert.IsType<NotFoundResult>(result);
        Assert.Equal(0, service.CallCount);
    }

    [Fact]
    public async Task Reset_WhenE2eModeIsEnabled_ResetsConfiguredDatabase()
    {
        var service = new RecordingResetService();
        var controller = CreateController(enabled: true, service);

        var result = await controller.Reset(TestContext.Current.CancellationToken);

        Assert.IsType<NoContentResult>(result);
        Assert.Equal(1, service.CallCount);
    }

    [Fact]
    public async Task Reset_InProduction_RemainsUnavailableWhenFlagIsEnabled()
    {
        var service = new RecordingResetService();
        var controller = CreateController(
            enabled: true,
            service,
            environmentName: Environments.Production);

        var result = await controller.Reset(TestContext.Current.CancellationToken);

        Assert.IsType<NotFoundResult>(result);
        Assert.Equal(0, service.CallCount);
    }

    [Theory]
    [InlineData("trackranker", false)]
    [InlineData("trackranker_test", false)]
    [InlineData("", false)]
    [InlineData("trackranker_e2e", true)]
    [InlineData("TRACKRANKER_E2E", true)]
    public void IsSafeDatabaseName_OnlyAllowsDedicatedE2eDatabases(
        string databaseName,
        bool expected)
    {
        Assert.Equal(expected, E2eDataResetService.IsSafeDatabaseName(databaseName));
    }

    [Fact]
    public void Reset_DoesNotAcceptADatabaseNameFromTheRequest()
    {
        var parameters = typeof(TestingController)
            .GetMethod(nameof(TestingController.Reset))!
            .GetParameters();

        var parameter = Assert.Single(parameters);
        Assert.Equal(typeof(CancellationToken), parameter.ParameterType);
    }

    private static TestingController CreateController(
        bool enabled,
        IE2eDataResetService service,
        string environmentName = "Development")
    {
        return new TestingController(
            Options.Create(new E2eOptions { Enabled = enabled }),
            new TestHostEnvironment { EnvironmentName = environmentName },
            service);
    }

    private sealed class TestHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ApplicationName { get; set; } = "TrackRanker.Api.Tests";
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = null!;
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
