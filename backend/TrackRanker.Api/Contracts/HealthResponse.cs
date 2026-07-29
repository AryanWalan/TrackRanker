namespace TrackRanker.Api.Contracts;

public sealed record HealthResponse(
    string Status,
    string Application,
    DateTimeOffset TimestampUtc);
