using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TrackRanker.Api.Contracts;

namespace TrackRanker.Api.Controllers;

[ApiController]
[DisableRateLimiting]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<HealthResponse>(StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse("Healthy", "TrackRanker.Api", DateTimeOffset.UtcNow));
    }
}
