using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public interface ISessionCompletionRepository
{
    Task<IReadOnlyList<SessionCompletion>> GetAllAsync(
        CancellationToken cancellationToken = default);
    Task<SessionCompletion?> GetByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default);
    Task<bool> CreateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default);
    Task<bool> DeleteByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default);
}
