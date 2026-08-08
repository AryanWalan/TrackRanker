using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using TrackRanker.Api.Data;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public sealed class EfTrainingSessionRepository : ITrainingSessionRepository
{
    private readonly TrackRankerDbContext _context;

    public EfTrainingSessionRepository(TrackRankerDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TrainingSession>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.TrainingSessions
            .AsNoTracking()
            .OrderByDescending(session => session.SessionDate)
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

        return await _context.TrainingSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(session => session.Id == id, cancellationToken);
    }

    public async Task CreateAsync(
        TrainingSession session,
        CancellationToken cancellationToken = default)
    {
        _context.TrainingSessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> UpdateAsync(
        TrainingSession session,
        CancellationToken cancellationToken = default)
    {
        var existing = await _context.TrainingSessions
            .FirstOrDefaultAsync(candidate => candidate.Id == session.Id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        _context.Entry(existing).CurrentValues.SetValues(session);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(id, out _))
        {
            return false;
        }

        var session = await _context.TrainingSessions
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (session is null)
        {
            return false;
        }

        _context.TrainingSessions.Remove(session);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
