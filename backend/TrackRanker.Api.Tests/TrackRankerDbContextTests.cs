using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.EntityFrameworkCore.Extensions;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Data;
using TrackRanker.Api.Models;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class TrackRankerDbContextTests
{
    [Fact]
    public void Model_exposes_expected_sets_collections_and_required_keys()
    {
        using var context = CreateMongoContext();

        Assert.NotNull(context.TrainingSessions);
        Assert.NotNull(context.SessionCompletions);

        var session = context.Model.FindEntityType(typeof(TrainingSession));
        var completion = context.Model.FindEntityType(typeof(SessionCompletion));
        Assert.NotNull(session);
        Assert.NotNull(completion);

        Assert.Equal("trainingSessions", session.GetCollectionName());
        Assert.Equal("sessionCompletions", completion.GetCollectionName());
        Assert.Equal(nameof(TrainingSession.Id), Assert.Single(session.FindPrimaryKey()!.Properties).Name);
        Assert.Equal(nameof(SessionCompletion.Id), Assert.Single(completion.FindPrimaryKey()!.Properties).Name);
        Assert.False(session.FindProperty(nameof(TrainingSession.Title))!.IsNullable);
        Assert.False(session.FindProperty(nameof(TrainingSession.Prescription))!.IsNullable);
        Assert.False(completion.FindProperty(nameof(SessionCompletion.TrainingSessionId))!.IsNullable);
    }

    private static TrackRankerDbContext CreateMongoContext()
    {
        var client = new MongoClient("mongodb://127.0.0.1:27017");
        var options = new DbContextOptionsBuilder<TrackRankerDbContext>()
            .UseMongoDB(client, "trackranker_model_tests")
            .Options;
        return new TrackRankerDbContext(
            options,
            Options.Create(new MongoDbOptions
            {
                ConnectionString = "mongodb://127.0.0.1:27017",
                DatabaseName = "trackranker_model_tests",
                UseTransactions = false
            }));
    }
}
