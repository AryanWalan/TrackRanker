using MongoDB.Bson;
using MongoDB.Driver;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public sealed class MongoTrainingSessionRepository : ITrainingSessionRepository
{
    private const string CollectionName = "trainingSessions";
    private readonly IMongoCollection<TrainingSession> _sessions;

    public MongoTrainingSessionRepository(IMongoDatabase database)
    {
        _sessions = database.GetCollection<TrainingSession>(CollectionName);
    }

    public async Task<IReadOnlyList<TrainingSession>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _sessions.Find(FilterDefinition<TrainingSession>.Empty)
            .SortByDescending(session => session.SessionDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<TrainingSession?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return null;
        }

        return await _sessions.Find(session => session.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task CreateAsync(
        TrainingSession session,
        CancellationToken cancellationToken = default)
    {
        return _sessions.InsertOneAsync(session, cancellationToken: cancellationToken);
    }

    public async Task<bool> UpdateAsync(
        TrainingSession session,
        CancellationToken cancellationToken = default)
    {
        var result = await _sessions.ReplaceOneAsync(
            existing => existing.Id == session.Id,
            session,
            cancellationToken: cancellationToken);
        return result.MatchedCount == 1;
    }

    public async Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var result = await _sessions.DeleteOneAsync(
            session => session.Id == id,
            cancellationToken);
        return result.DeletedCount == 1;
    }
}
