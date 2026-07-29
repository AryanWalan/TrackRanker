using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public interface ITrainingSessionRepository
{
    Task<IReadOnlyList<TrainingSession>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TrainingSession?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task CreateAsync(TrainingSession session, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(TrainingSession session, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
