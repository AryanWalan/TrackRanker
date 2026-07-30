using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using TrackRanker.Api.Controllers;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class ProgressServiceTests
{
    [Fact]
    public async Task Get_WithNoData_ReturnsHttp200RankOneAndLockedAchievements()
    {
        var controller = new ProgressController(CreateService());

        var action = await controller.Get(TestContext.Current.CancellationToken);

        var ok = Assert.IsType<OkObjectResult>(action.Result);
        var progress = Assert.IsType<ProgressResponse>(ok.Value);
        Assert.Equal(0, progress.TotalXp);
        Assert.Equal(1, progress.TrackRank);
        Assert.Equal(0, progress.CurrentRankXp);
        Assert.Equal(100, progress.XpPerRank);
        Assert.Equal(6, progress.Achievements.Count);
        Assert.All(progress.Achievements, achievement =>
        {
            Assert.False(achievement.IsUnlocked);
            Assert.Equal(0, achievement.CurrentProgress);
        });
    }

    [Fact]
    public async Task CompletedSession_AwardsExactlyTwentyXp()
    {
        var progress = await CreateService(Completion())
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(20, progress.TotalXp);
        Assert.Equal(1, progress.CompletedSessions);
        Assert.Equal(0, progress.MeaningfulReflections);
        Assert.Equal(0, progress.PairedConfidenceCheckIns);
    }

    [Fact]
    public async Task MeaningfulReflection_AwardsTenAdditionalXp()
    {
        var progress = await CreateService(Completion(
                new SessionReflection { WentWell = "Stayed relaxed." }))
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(30, progress.TotalXp);
        Assert.Equal(1, progress.MeaningfulReflections);
    }

    [Fact]
    public async Task WhitespaceOnlyReflection_DoesNotAwardReflectionXp()
    {
        var progress = await CreateService(Completion(
                new SessionReflection
                {
                    WentWell = " ",
                    Improved = "\t",
                    WasDifficult = "\r\n"
                }))
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(20, progress.TotalXp);
        Assert.Equal(0, progress.MeaningfulReflections);
    }

    [Fact]
    public async Task PairedConfidence_AwardsFiveAdditionalXp()
    {
        var progress = await CreateService(Completion(
                new SessionReflection
                {
                    ConfidenceBefore = 2,
                    ConfidenceAfter = 4
                }))
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(25, progress.TotalXp);
        Assert.Equal(1, progress.PairedConfidenceCheckIns);
    }

    [Fact]
    public async Task OneSidedConfidence_DoesNotAwardConfidenceXp()
    {
        var progress = await CreateService(Completion(
                new SessionReflection { ConfidenceBefore = 3 }))
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(20, progress.TotalXp);
        Assert.Equal(0, progress.PairedConfidenceCheckIns);
    }

    [Fact]
    public async Task MultipleSessions_CombineAllProcessXpComponents()
    {
        var progress = await CreateService(
                Completion(new SessionReflection
                {
                    WentWell = "Good rhythm.",
                    ConfidenceBefore = 2,
                    ConfidenceAfter = 4
                }),
                Completion(new SessionReflection { NextFocus = "Stay patient." }),
                Completion())
            .GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(85, progress.TotalXp);
        Assert.Equal(3, progress.CompletedSessions);
        Assert.Equal(2, progress.MeaningfulReflections);
        Assert.Equal(1, progress.PairedConfidenceCheckIns);
    }

    [Fact]
    public void TrackRank_UsesSpecifiedNinetyNineAndOneHundredXpBoundary()
    {
        Assert.Equal(1, ProgressService.CalculateTrackRank(99));
        Assert.Equal(2, ProgressService.CalculateTrackRank(100));
        Assert.Equal(3, ProgressService.CalculateTrackRank(235));
    }

    [Fact]
    public void CurrentRankXp_UsesRemainderWithinCurrentRank()
    {
        Assert.Equal(0, ProgressService.CalculateCurrentRankXp(100));
        Assert.Equal(35, ProgressService.CalculateCurrentRankXp(235));
    }

    [Fact]
    public async Task Achievements_ReportProgressAndUnlockExactlyAtThreshold()
    {
        var completions = Enumerable.Range(0, 5)
            .Select(index => Completion(new SessionReflection
            {
                WentWell = "Reflected.",
                ConfidenceBefore = index < 3 ? 3 : null,
                ConfidenceAfter = index < 3 ? 4 : null
            }))
            .ToArray();

        var progress = await CreateService(completions)
            .GetProgressAsync(TestContext.Current.CancellationToken);

        AssertAchievement(progress, "first-finish", true, 1, 1);
        AssertAchievement(progress, "reflective-start", true, 1, 1);
        AssertAchievement(progress, "building-routine", true, 5, 5);
        AssertAchievement(progress, "looking-back", true, 5, 5);
        AssertAchievement(progress, "check-in", true, 3, 3);
        AssertAchievement(progress, "ten-sessions", false, 5, 10);
    }

    [Fact]
    public async Task AchievementProgress_IsClampedAtThreshold()
    {
        var completions = Enumerable.Range(0, 12)
            .Select(_ => Completion(new SessionReflection
            {
                Improved = "Recorded.",
                ConfidenceBefore = 3,
                ConfidenceAfter = 3
            }))
            .ToArray();

        var progress = await CreateService(completions)
            .GetProgressAsync(TestContext.Current.CancellationToken);

        AssertAchievement(progress, "building-routine", true, 5, 5);
        AssertAchievement(progress, "looking-back", true, 5, 5);
        AssertAchievement(progress, "check-in", true, 3, 3);
        AssertAchievement(progress, "ten-sessions", true, 10, 10);
    }

    [Fact]
    public async Task DeletedCompletion_CannotContributeXp()
    {
        var completion = Completion(new SessionReflection { WentWell = "Reflected." });
        var repository = new FakeCompletionRepository(completion);
        var service = new ProgressService(repository);

        Assert.True(await repository.DeleteByTrainingSessionIdAsync(
            completion.TrainingSessionId,
            TestContext.Current.CancellationToken));
        var progress = await service.GetProgressAsync(TestContext.Current.CancellationToken);

        Assert.Equal(0, progress.TotalXp);
        Assert.Equal(0, progress.CompletedSessions);
    }

    private static void AssertAchievement(
        ProgressResponse progress,
        string id,
        bool unlocked,
        int current,
        int required)
    {
        var achievement = Assert.Single(progress.Achievements, item => item.Id == id);
        Assert.Equal(unlocked, achievement.IsUnlocked);
        Assert.Equal(current, achievement.CurrentProgress);
        Assert.Equal(required, achievement.RequiredProgress);
    }

    private static ProgressService CreateService(params SessionCompletion[] completions) =>
        new(new FakeCompletionRepository(completions));

    private static SessionCompletion Completion(SessionReflection? reflection = null)
    {
        var timestamp = new DateTime(2026, 7, 30, 0, 0, 0, DateTimeKind.Utc);
        return new SessionCompletion
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TrainingSessionId = ObjectId.GenerateNewId().ToString(),
            CompletedAtUtc = timestamp,
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            Reflection = reflection ?? new SessionReflection(),
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private sealed class FakeCompletionRepository(
        params SessionCompletion[] completions) : ISessionCompletionRepository
    {
        private readonly List<SessionCompletion> _items = [.. completions];

        public Task<IReadOnlyList<SessionCompletion>> GetAllAsync(
            CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<SessionCompletion>>(_items);

        public Task<SessionCompletion?> GetByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(_items.SingleOrDefault(
                completion => completion.TrainingSessionId == trainingSessionId));

        public Task<bool> CreateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default)
        {
            _items.Add(completion);
            return Task.FromResult(true);
        }

        public Task<bool> UpdateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(_items.Any(item => item.Id == completion.Id));

        public Task<bool> DeleteByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(
                _items.RemoveAll(item =>
                    item.TrainingSessionId == trainingSessionId) == 1);
    }
}
