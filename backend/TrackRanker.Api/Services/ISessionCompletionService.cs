using TrackRanker.Api.DTOs;

namespace TrackRanker.Api.Services;

public interface ISessionCompletionService
{
    Task<SessionCompletionOperation<SessionCompletionResponse>> GetAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default);
    Task<SessionCompletionOperation<SessionCompletionResponse>> CreateAsync(
        string trainingSessionId,
        CreateSessionCompletionRequest request,
        CancellationToken cancellationToken = default);
    Task<SessionCompletionOperation<SessionCompletionResponse>> UpdateAsync(
        string trainingSessionId,
        UpdateSessionCompletionRequest request,
        CancellationToken cancellationToken = default);
    Task<SessionCompletionOutcome> DeleteAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default);
}
