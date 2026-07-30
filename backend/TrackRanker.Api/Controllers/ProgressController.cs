using Microsoft.AspNetCore.Mvc;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;

namespace TrackRanker.Api.Controllers;

[ApiController]
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
