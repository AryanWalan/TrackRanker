using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Services;

namespace TrackRanker.Api.Controllers;

[ApiController]
[DisableRateLimiting]
[Route("api/testing")]
public sealed class TestingController : ControllerBase
{
    private readonly E2eOptions _options;
    private readonly IHostEnvironment _environment;
    private readonly IE2eDataResetService _resetService;

    public TestingController(
        IOptions<E2eOptions> options,
        IHostEnvironment environment,
        IE2eDataResetService resetService)
    {
        _options = options.Value;
        _environment = environment;
        _resetService = resetService;
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset(CancellationToken cancellationToken)
    {
        if (!_options.Enabled || _environment.IsProduction())
        {
            return NotFound();
        }

        await _resetService.ResetAsync(cancellationToken);
        return NoContent();
    }
}
