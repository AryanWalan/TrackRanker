namespace TrackRanker.Api.Services;

public enum SessionCompletionOutcome
{
    Success,
    ParentNotFound,
    CompletionNotFound,
    Conflict
}

public sealed record SessionCompletionOperation<T>(
    SessionCompletionOutcome Outcome,
    T? Value = default);
