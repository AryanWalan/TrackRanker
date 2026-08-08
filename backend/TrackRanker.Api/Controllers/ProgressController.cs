using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;
using TrackRanker.Api.Security;

namespace TrackRanker.Api.Controllers;

[ApiController]
[EnableRateLimiting(RateLimitPolicyNames.Api)]
[Route("api/progress")]
public sealed class ProgressController : ControllerBase
{
    private readonly IProgressService _service;

    public ProgressController(IProgressService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ProgressResponse>> Get(
        CancellationToken cancellationToken)
    {
        return Ok(await _service.GetProgressAsync(cancellationToken));
    }
}
