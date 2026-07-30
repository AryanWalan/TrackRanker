using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;

namespace TrackRanker.Api.Services;

public sealed class ProgressService : IProgressService
{
    public const int CompletedSessionXp = 20;
    public const int MeaningfulReflectionXp = 10;
    public const int PairedConfidenceXp = 5;
    public const int XpPerRank = 100;

    private readonly ISessionCompletionRepository _completionRepository;

    public ProgressService(ISessionCompletionRepository completionRepository)
    {
        _completionRepository = completionRepository;
    }

    public async Task<ProgressResponse> GetProgressAsync(
        CancellationToken cancellationToken = default)
    {
        var completions = await _completionRepository.GetAllAsync(cancellationToken);
        var completedSessions = completions.Count;
        var meaningfulReflections = completions.Count(HasMeaningfulReflection);
        var pairedConfidenceCheckIns = completions.Count(HasPairedConfidence);
        var totalXp = completedSessions * CompletedSessionXp
            + meaningfulReflections * MeaningfulReflectionXp
            + pairedConfidenceCheckIns * PairedConfidenceXp;

        return new ProgressResponse(
            totalXp,
            CalculateTrackRank(totalXp),
            CalculateCurrentRankXp(totalXp),
            XpPerRank,
            completedSessions,
            meaningfulReflections,
            pairedConfidenceCheckIns,
            CreateAchievements(
                completedSessions,
                meaningfulReflections,
                pairedConfidenceCheckIns));
    }

    public static int CalculateTrackRank(int totalXp) =>
        totalXp / XpPerRank + 1;

    public static int CalculateCurrentRankXp(int totalXp) =>
        totalXp % XpPerRank;

    private static bool HasMeaningfulReflection(SessionCompletion completion)
    {
        var reflection = completion.Reflection;
        return HasText(reflection.WentWell)
            || HasText(reflection.Improved)
            || HasText(reflection.WasDifficult)
            || HasText(reflection.NextFocus)
            || HasText(reflection.CoachFeedback);
    }

    private static bool HasPairedConfidence(SessionCompletion completion)
    {
        return completion.Reflection.ConfidenceBefore.HasValue
            && completion.Reflection.ConfidenceAfter.HasValue;
    }

    private static bool HasText(string? value) =>
        !string.IsNullOrWhiteSpace(value);

    private static IReadOnlyList<AchievementProgressResponse> CreateAchievements(
        int completedSessions,
        int meaningfulReflections,
        int pairedConfidenceCheckIns) =>
        [
            Achievement(
                "first-finish",
                "First Finish",
                "Log your first completed training session.",
                completedSessions,
                1),
            Achievement(
                "reflective-start",
                "Reflective Start",
                "Reflect on your first completed session.",
                meaningfulReflections,
                1),
            Achievement(
                "building-routine",
                "Building Routine",
                "Log five completed training sessions.",
                completedSessions,
                5),
            Achievement(
                "looking-back",
                "Looking Back",
                "Complete five post-session reflections.",
                meaningfulReflections,
                5),
            Achievement(
                "check-in",
                "Check In",
                "Record confidence before and after three sessions.",
                pairedConfidenceCheckIns,
                3),
            Achievement(
                "ten-sessions",
                "Ten Sessions",
                "Log ten completed training sessions.",
                completedSessions,
                10)
        ];

    private static AchievementProgressResponse Achievement(
        string id,
        string name,
        string description,
        int progress,
        int requiredProgress) =>
        new(
            id,
            name,
            description,
            progress >= requiredProgress,
            Math.Min(progress, requiredProgress),
            requiredProgress);
}
