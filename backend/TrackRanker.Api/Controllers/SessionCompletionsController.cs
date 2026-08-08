using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MongoDB.Bson;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Services;
using TrackRanker.Api.Security;

namespace TrackRanker.Api.Controllers;

[ApiController]
[EnableRateLimiting(RateLimitPolicyNames.Api)]
[Route("api/training-sessions/{sessionId}/completion")]
public sealed class SessionCompletionsController : ControllerBase
{
    private readonly ISessionCompletionService _service;

    public SessionCompletionsController(ISessionCompletionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<SessionCompletionResponse>> Get(
        string sessionId,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(sessionId, out _))
        {
            return InvalidId();
        }

        var result = await _service.GetAsync(sessionId, cancellationToken);
        return result.Outcome == SessionCompletionOutcome.Success
            ? Ok(result.Value)
            : NotFound();
    }

    [HttpPost]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<ActionResult<SessionCompletionResponse>> Create(
        string sessionId,
        CreateSessionCompletionRequest request,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(sessionId, out _))
        {
            return InvalidId();
        }

        var result = await _service.CreateAsync(sessionId, request, cancellationToken);
        return result.Outcome switch
        {
            SessionCompletionOutcome.Success => CreatedAtAction(
                nameof(Get),
                new { sessionId },
                result.Value),
            SessionCompletionOutcome.Conflict => Conflict(new ProblemDetails
            {
                Title = "Session completion already exists",
                Detail = "Edit the existing completed-session record instead.",
                Status = StatusCodes.Status409Conflict
            }),
            _ => NotFound()
        };
    }

    [HttpPut]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<ActionResult<SessionCompletionResponse>> Update(
        string sessionId,
        UpdateSessionCompletionRequest request,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(sessionId, out _))
        {
            return InvalidId();
        }

        var result = await _service.UpdateAsync(sessionId, request, cancellationToken);
        return result.Outcome == SessionCompletionOutcome.Success
            ? Ok(result.Value)
            : NotFound();
    }

    [HttpDelete]
    [EnableRateLimiting(RateLimitPolicyNames.Write)]
    public async Task<IActionResult> Delete(
        string sessionId,
        CancellationToken cancellationToken)
    {
        if (!ObjectId.TryParse(sessionId, out _))
        {
            return InvalidId();
        }

        return await _service.DeleteAsync(sessionId, cancellationToken)
            == SessionCompletionOutcome.Success
            ? NoContent()
            : NotFound();
    }

    private BadRequestObjectResult InvalidId()
    {
        return BadRequest(new ProblemDetails
        {
            Title = "Invalid training session ID",
            Detail = "The training session ID must be a valid MongoDB ObjectId.",
            Status = StatusCodes.Status400BadRequest
        });
    }
}
