using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Data;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class EfRepositoryTests
{
    [Fact]
    public async Task Training_session_list_is_newest_first_and_lookup_handles_missing_ids()
    {
        await using var context = CreateContext();
        var repository = new EfTrainingSessionRepository(context);
        var older = CreateSession(DateTime.UtcNow.AddDays(-1));
        var newer = CreateSession(DateTime.UtcNow);
        context.TrainingSessions.AddRange(older, newer);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var sessions = await repository.GetAllAsync(TestContext.Current.CancellationToken);

        Assert.Equal([newer.Id, older.Id], sessions.Select(session => session.Id));
        Assert.Equal(newer.Id, (await repository.GetByIdAsync(
            newer.Id,
            TestContext.Current.CancellationToken))?.Id);
        Assert.Null(await repository.GetByIdAsync(
            ObjectId.GenerateNewId().ToString(),
            TestContext.Current.CancellationToken));
        Assert.Null(await repository.GetByIdAsync("not-an-object-id", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Training_session_repository_creates_updates_and_deletes()
    {
        await using var context = CreateContext();
        var repository = new EfTrainingSessionRepository(context);
        var session = CreateSession(DateTime.UtcNow);

        await repository.CreateAsync(session, TestContext.Current.CancellationToken);
        session.Title = "Updated title";
        session.Status = TrainingSessionStatus.Completed;

        Assert.True(await repository.UpdateAsync(session, TestContext.Current.CancellationToken));
        var updated = await repository.GetByIdAsync(session.Id, TestContext.Current.CancellationToken);
        Assert.Equal("Updated title", updated?.Title);
        Assert.Equal(TrainingSessionStatus.Completed, updated?.Status);

        Assert.True(await repository.DeleteAsync(session.Id, TestContext.Current.CancellationToken));
        Assert.False(await repository.DeleteAsync(session.Id, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Completion_repository_creates_updates_and_deletes_nested_evidence()
    {
        await using var context = CreateContext();
        var repository = new EfSessionCompletionRepository(context);
        var completion = CreateCompletion();

        Assert.True(await repository.CreateAsync(completion, TestContext.Current.CancellationToken));
        var created = await repository.GetByTrainingSessionIdAsync(
            completion.TrainingSessionId,
            TestContext.Current.CancellationToken);
        Assert.Equal("Strong finish", created?.Reflection.WentWell);
        Assert.Single(created!.RepetitionResults);

        completion.ActualIntensity = 9;
        completion.Reflection = new SessionReflection { NextFocus = "Relax shoulders" };
        completion.RepetitionResults = [];
        Assert.True(await repository.UpdateAsync(completion, TestContext.Current.CancellationToken));

        var updated = await repository.GetByTrainingSessionIdAsync(
            completion.TrainingSessionId,
            TestContext.Current.CancellationToken);
        Assert.Equal(9, updated?.ActualIntensity);
        Assert.Equal("Relax shoulders", updated?.Reflection.NextFocus);
        Assert.Empty(updated!.RepetitionResults);

        Assert.True(await repository.DeleteByTrainingSessionIdAsync(
            completion.TrainingSessionId,
            TestContext.Current.CancellationToken));
        Assert.False(await repository.DeleteByTrainingSessionIdAsync(
            completion.TrainingSessionId,
            TestContext.Current.CancellationToken));
    }

    private static TrackRankerDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<TrackRankerDbContext>()
            .UseInMemoryDatabase($"trackranker-{Guid.NewGuid()}")
            .Options;
        return new TrackRankerDbContext(
            options,
            Options.Create(new MongoDbOptions
            {
                ConnectionString = "mongodb://unused",
                DatabaseName = "unused",
                UseTransactions = false
            }));
    }

    private static TrainingSession CreateSession(DateTime sessionDate)
    {
        return new TrainingSession
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Title = "Speed session",
            SessionType = SessionType.MaxVelocity,
            SessionDate = sessionDate,
            Prescription = "3 x 60m",
            Status = TrainingSessionStatus.Planned,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }

    private static SessionCompletion CreateCompletion()
    {
        return new SessionCompletion
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TrainingSessionId = ObjectId.GenerateNewId().ToString(),
            CompletedAtUtc = DateTime.UtcNow,
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            RepetitionResults =
            [
                new RepetitionResult
                {
                    SetNumber = 1,
                    RepetitionNumber = 1,
                    DistanceMetres = 60,
                    TimeSeconds = 7.1,
                    Notes = "Smooth"
                }
            ],
            Reflection = new SessionReflection { WentWell = "Strong finish" },
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };
    }
}
