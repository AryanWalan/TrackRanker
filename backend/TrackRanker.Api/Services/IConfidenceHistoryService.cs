using TrackRanker.Api.DTOs;

namespace TrackRanker.Api.Services;

public interface IConfidenceHistoryService
{
    Task<ConfidenceHistoryResponse> GetHistoryAsync(
        CancellationToken cancellationToken = default);
}
