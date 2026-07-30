using TrackRanker.Api.DTOs;

namespace TrackRanker.Api.Services;

public interface IProgressService
{
    Task<ProgressResponse> GetProgressAsync(
        CancellationToken cancellationToken = default);
}
