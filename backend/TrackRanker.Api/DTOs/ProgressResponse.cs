namespace TrackRanker.Api.DTOs;

public sealed record ProgressResponse(
    int TotalXp,
    int TrackRank,
    int CurrentRankXp,
    int XpPerRank,
    int CompletedSessions,
    int MeaningfulReflections,
    int PairedConfidenceCheckIns,
    IReadOnlyList<AchievementProgressResponse> Achievements);

public sealed record AchievementProgressResponse(
    string Id,
    string Name,
    string Description,
    bool IsUnlocked,
    int CurrentProgress,
    int RequiredProgress);
