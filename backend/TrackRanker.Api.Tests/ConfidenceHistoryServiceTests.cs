using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using TrackRanker.Api.Controllers;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class ConfidenceHistoryServiceTests
{
    [Fact]
    public async Task GetHistory_WithNoEvidence_ReturnsOkAndEmptySummary()
    {
        var service = CreateService([], []);
        var controller = new ConfidenceController(service);

        var action = await controller.GetHistory(TestContext.Current.CancellationToken);

        var ok = Assert.IsType<OkObjectResult>(action.Result);
        var history = Assert.IsType<ConfidenceHistoryResponse>(ok.Value);
        Assert.Equal(0, history.TotalReflectedSessions);
        Assert.Equal(0, history.SessionsWithConfidence);
        Assert.Equal(0, history.SessionsImproved);
        Assert.Null(history.AverageConfidenceBefore);
        Assert.Null(history.AverageConfidenceAfter);
        Assert.Empty(history.Entries);
    }

    [Fact]
    public async Task GetHistory_IncludesReflectionsAndTheirSessionInformation()
    {
        var session = Session("Evidence session", SessionType.MaxVelocity, 10);
        var completion = Completion(
            session.Id,
            new SessionReflection
            {
                WentWell = "Stayed relaxed.",
                Improved = "Better posture.",
                CoachFeedback = "Good rhythm."
            });

        var history = await CreateService([session], [completion])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        var entry = Assert.Single(history.Entries);
        Assert.Equal(session.Id, entry.TrainingSessionId);
        Assert.Equal("Evidence session", entry.SessionTitle);
        Assert.Equal(SessionType.MaxVelocity, entry.SessionType);
        Assert.Equal("Stayed relaxed.", entry.WentWell);
        Assert.Equal("Better posture.", entry.Improved);
        Assert.Equal("Good rhythm.", entry.CoachFeedback);
    }

    [Fact]
    public async Task GetHistory_ExcludesCompletionWithoutReflectionOrConfidence()
    {
        var session = Session("No evidence", SessionType.Tempo, 10);

        var history = await CreateService(
                [session],
                [Completion(session.Id, new SessionReflection())])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        Assert.Empty(history.Entries);
    }

    [Fact]
    public async Task GetHistory_CountsOnlyStrictConfidenceImprovements()
    {
        var improved = Session("Improved", SessionType.Acceleration, 12);
        var equal = Session("Equal", SessionType.Starts, 11);
        var lower = Session("Lower", SessionType.SpeedEndurance, 10);

        var history = await CreateService(
                [improved, equal, lower],
                [
                    Completion(improved.Id, Confidence(2, 4)),
                    Completion(equal.Id, Confidence(3, 3)),
                    Completion(lower.Id, Confidence(4, 2))
                ])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        Assert.Equal(3, history.SessionsWithConfidence);
        Assert.Equal(1, history.SessionsImproved);
    }

    [Fact]
    public async Task GetHistory_MissingConfidenceValuesRemainNullable()
    {
        var session = Session("Partial", SessionType.Recovery, 10);

        var history = await CreateService(
                [session],
                [Completion(session.Id, new SessionReflection
                {
                    WentWell = "Moved freely.",
                    ConfidenceBefore = 3
                })])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        var entry = Assert.Single(history.Entries);
        Assert.Equal(3, entry.ConfidenceBefore);
        Assert.Null(entry.ConfidenceAfter);
        Assert.Equal(0, history.SessionsWithConfidence);
        Assert.Equal(3, history.AverageConfidenceBefore);
        Assert.Null(history.AverageConfidenceAfter);
    }

    [Fact]
    public async Task GetHistory_CalculatesAndRoundsAveragesIndependently()
    {
        var first = Session("First", SessionType.Acceleration, 12);
        var second = Session("Second", SessionType.Acceleration, 11);
        var third = Session("Third", SessionType.Acceleration, 10);

        var history = await CreateService(
                [first, second, third],
                [
                    Completion(first.Id, Confidence(2, 3)),
                    Completion(second.Id, Confidence(3, 4)),
                    Completion(third.Id, new SessionReflection { ConfidenceAfter = 5 })
                ])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        Assert.Equal(2.5, history.AverageConfidenceBefore);
        Assert.Equal(4, history.AverageConfidenceAfter);
    }

    [Fact]
    public async Task GetHistory_OrdersNewestSessionFirstWithStableTieBreak()
    {
        var older = Session("Older", SessionType.Other, 10);
        var sameDateA = Session("Same A", SessionType.Other, 12);
        var sameDateB = Session("Same B", SessionType.Other, 12);

        var history = await CreateService(
                [older, sameDateA, sameDateB],
                [
                    Completion(older.Id, Confidence(2, 3)),
                    Completion(sameDateA.Id, Confidence(2, 3)),
                    Completion(sameDateB.Id, Confidence(2, 3))
                ])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        Assert.Equal(older.Id, history.Entries[^1].TrainingSessionId);
        Assert.Equal(
            history.Entries.OrderByDescending(entry => entry.SessionDate)
                .ThenByDescending(entry => entry.TrainingSessionId, StringComparer.Ordinal)
                .Select(entry => entry.TrainingSessionId),
            history.Entries.Select(entry => entry.TrainingSessionId));
    }

    [Fact]
    public async Task GetHistory_IgnoresEvidenceWhoseParentSessionIsMissing()
    {
        var history = await CreateService(
                [],
                [Completion(ObjectId.GenerateNewId().ToString(), Confidence(2, 4))])
            .GetHistoryAsync(TestContext.Current.CancellationToken);

        Assert.Empty(history.Entries);
    }

    private static SessionReflection Confidence(int before, int after) =>
        new() { ConfidenceBefore = before, ConfidenceAfter = after };

    private static TrainingSession Session(
        string title,
        SessionType type,
        int day)
    {
        var timestamp = new DateTime(2026, 8, day, 0, 0, 0, DateTimeKind.Utc);
        return new TrainingSession
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Title = title,
            SessionType = type,
            SessionDate = timestamp,
            Prescription = "3 × 60m",
            Status = TrainingSessionStatus.Completed,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private static SessionCompletion Completion(
        string trainingSessionId,
        SessionReflection reflection)
    {
        var timestamp = new DateTime(2026, 8, 12, 1, 0, 0, DateTimeKind.Utc);
        return new SessionCompletion
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TrainingSessionId = trainingSessionId,
            CompletedAtUtc = timestamp,
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            Reflection = reflection,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private static ConfidenceHistoryService CreateService(
        IReadOnlyList<TrainingSession> sessions,
        IReadOnlyList<SessionCompletion> completions) =>
        new(new FakeCompletionRepository(completions), new FakeSessionRepository(sessions));

    private sealed class FakeCompletionRepository(
        IReadOnlyList<SessionCompletion> completions) : ISessionCompletionRepository
    {
        public Task<IReadOnlyList<SessionCompletion>> GetAllAsync(
            CancellationToken cancellationToken = default) =>
            Task.FromResult(completions);

        public Task<SessionCompletion?> GetByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(completions.SingleOrDefault(
                completion => completion.TrainingSessionId == trainingSessionId));

        public Task<bool> CreateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<bool> UpdateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<bool> DeleteByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
    }

    private sealed class FakeSessionRepository(
        IReadOnlyList<TrainingSession> sessions) : ITrainingSessionRepository
    {
        public Task<IReadOnlyList<TrainingSession>> GetAllAsync(
            CancellationToken cancellationToken = default) =>
            Task.FromResult(sessions);

        public Task<TrainingSession?> GetByIdAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(sessions.SingleOrDefault(session => session.Id == id));

        public Task CreateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default) =>
            Task.CompletedTask;

        public Task<bool> UpdateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);

        public Task<bool> DeleteAsync(
            string id,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(false);
    }
}
