namespace TrackRanker.Api.Services;

public interface IE2eDataResetService
{
    Task ResetAsync(CancellationToken cancellationToken = default);
}
