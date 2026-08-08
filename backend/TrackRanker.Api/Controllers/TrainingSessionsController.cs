using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MongoDB.Bson;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;
using TrackRanker.Api.Security;

namespace TrackRanker.Api.Controllers;

[ApiController]
[EnableRateLimiting(RateLimitPolicyNames.Api)]
[Route("api/training-sessions")]
public sealed class TrainingSessionsController : ControllerBase
{
    private readonly ITrainingSessionService _service;

    public TrainingSessionsController(ITrainingSessionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TrainingSessionResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        return Ok(await _service.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TrainingSessionResponse>> GetById(
        string id,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid training session ID",
                Detail = "The training session ID must be a valid MongoDB ObjectId.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var session = await _service.GetByIdAsync(id, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpPost]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<ActionResult<TrainingSessionResponse>> Create(
        CreateTrainingSessionRequest request,
        CancellationToken cancellationToken)
    {
        var session = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = session.Id }, session);
    }

    [HttpPut("{id}")]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<ActionResult<TrainingSessionResponse>> Update(
        string id,
        UpdateTrainingSessionRequest request,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid training session ID",
                Detail = "The training session ID must be a valid MongoDB ObjectId.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var session = await _service.UpdateAsync(id, request, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpDelete("{id}")]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid training session ID",
                Detail = "The training session ID must be a valid MongoDB ObjectId.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        return await _service.DeleteAsync(id, cancellationToken)
            ? NoContent()
            : NotFound();
    }
}
