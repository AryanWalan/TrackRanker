using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;
using TrackRanker.Api.Security;

namespace TrackRanker.Api.Controllers;

[ApiController]
[EnableRateLimiting(RateLimitPolicyNames.Api)]
[Route("api/confidence")]
public sealed class ConfidenceController : ControllerBase
{
    private readonly IConfidenceHistoryService _service;

    public ConfidenceController(IConfidenceHistoryService service)
    {
        _service = service;
    }

    [HttpGet("history")]
    public async Task<ActionResult<ConfidenceHistoryResponse>> GetHistory(
        CancellationToken cancellationToken)
    {
        return Ok(await _service.GetHistoryAsync(cancellationToken));
    }
}
