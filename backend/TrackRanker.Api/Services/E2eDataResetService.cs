using MongoDB.Driver;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Services;

public sealed class E2eDataResetService : IE2eDataResetService
{
    private const string TrainingSessionsCollectionName = "trainingSessions";
    private const string SessionCompletionsCollectionName = "sessionCompletions";

    private readonly IMongoDatabase _database;

    public E2eDataResetService(IMongoDatabase database)
    {
        _database = database;
    }

    public static bool IsSafeDatabaseName(string? databaseName)
    {
        return !string.IsNullOrWhiteSpace(databaseName)
            && databaseName.EndsWith("_e2e", StringComparison.OrdinalIgnoreCase);
    }

    public async Task ResetAsync(CancellationToken cancellationToken = default)
    {
        var databaseName = _database.DatabaseNamespace.DatabaseName;
        if (!IsSafeDatabaseName(databaseName))
        {
            throw new InvalidOperationException(
                "E2E reset is restricted to a database whose name ends with '_e2e'.");
        }

        var sessions = _database.GetCollection<TrainingSession>(
            TrainingSessionsCollectionName);
        var completions = _database.GetCollection<SessionCompletion>(
            SessionCompletionsCollectionName);

        await completions.DeleteManyAsync(
            FilterDefinition<SessionCompletion>.Empty,
            cancellationToken);
        await sessions.DeleteManyAsync(
            FilterDefinition<TrainingSession>.Empty,
            cancellationToken);
    }
}
