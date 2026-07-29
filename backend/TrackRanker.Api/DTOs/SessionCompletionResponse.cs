namespace TrackRanker.Api.DTOs;

public sealed record SessionCompletionResponse(
    string Id,
    string TrainingSessionId,
    DateTime CompletedAtUtc,
    int ActualIntensity,
    int PerceivedDifficulty,
    IReadOnlyList<RepetitionResultDto> RepetitionResults,
    SessionReflectionDto Reflection,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);
