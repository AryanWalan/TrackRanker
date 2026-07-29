using MongoDB.Driver;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public sealed class MongoSessionCompletionRepository : ISessionCompletionRepository
{
    private const string CollectionName = "sessionCompletions";
    private readonly IMongoCollection<SessionCompletion> _completions;
    private readonly Lazy<Task> _indexTask;

    public MongoSessionCompletionRepository(IMongoDatabase database)
    {
        _completions = database.GetCollection<SessionCompletion>(CollectionName);
        _indexTask = new Lazy<Task>(CreateIndexesAsync);
    }

    public async Task<SessionCompletion?> GetByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureIndexesAsync();
        return await _completions
            .Find(completion => completion.TrainingSessionId == trainingSessionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> CreateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default)
    {
        await EnsureIndexesAsync();
        try
        {
            await _completions.InsertOneAsync(
                completion,
                cancellationToken: cancellationToken);
            return true;
        }
        catch (MongoWriteException exception)
            when (exception.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return false;
        }

    }

    public async Task<bool> UpdateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default)
    {
        await EnsureIndexesAsync();
        var result = await _completions.ReplaceOneAsync(
            existing => existing.Id == completion.Id,
            completion,
            cancellationToken: cancellationToken);
        return result.MatchedCount == 1;
    }

    public async Task<bool> DeleteByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        await EnsureIndexesAsync();
        var result = await _completions.DeleteOneAsync(
            completion => completion.TrainingSessionId == trainingSessionId,
            cancellationToken);
        return result.DeletedCount == 1;
    }

    private Task EnsureIndexesAsync()
    {
        return _indexTask.Value;
    }

    private Task CreateIndexesAsync()
    {
        var keys = Builders<SessionCompletion>.IndexKeys
            .Ascending(completion => completion.TrainingSessionId);
        var model = new CreateIndexModel<SessionCompletion>(
            keys,
            new CreateIndexOptions
            {
                Name = "ux_sessionCompletions_trainingSessionId",
                Unique = true
            });
        return _completions.Indexes.CreateOneAsync(model);
    }
}
