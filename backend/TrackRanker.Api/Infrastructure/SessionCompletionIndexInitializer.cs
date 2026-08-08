using MongoDB.Driver;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Infrastructure;

public sealed class SessionCompletionIndexInitializer : IHostedService
{
    private const string CollectionName = "sessionCompletions";
    private readonly IMongoDatabase _database;

    public SessionCompletionIndexInitializer(IMongoDatabase database)
    {
        _database = database;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var collection = _database.GetCollection<SessionCompletion>(CollectionName);
        var keys = Builders<SessionCompletion>.IndexKeys
            .Ascending(completion => completion.TrainingSessionId);
        var index = new CreateIndexModel<SessionCompletion>(
            keys,
            new CreateIndexOptions
            {
                Name = "ux_sessionCompletions_trainingSessionId",
                Unique = true
            });

        await collection.Indexes.CreateOneAsync(index, cancellationToken: cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
