using TrackRanker.Api.DTOs;

namespace TrackRanker.Api.Services;

public interface ITrainingSessionService
{
    Task<IReadOnlyList<TrainingSessionResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);
    Task<TrainingSessionResponse?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default);
    Task<TrainingSessionResponse> CreateAsync(
        CreateTrainingSessionRequest request,
        CancellationToken cancellationToken = default);
    Task<TrainingSessionResponse?> UpdateAsync(
        string id,
        UpdateTrainingSessionRequest request,
        CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
