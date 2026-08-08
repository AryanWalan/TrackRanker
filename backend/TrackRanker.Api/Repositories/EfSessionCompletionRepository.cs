using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using TrackRanker.Api.Data;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Repositories;

public sealed class EfSessionCompletionRepository : ISessionCompletionRepository
{
    private readonly TrackRankerDbContext _context;

    public EfSessionCompletionRepository(TrackRankerDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SessionCompletion>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.SessionCompletions
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<SessionCompletion?> GetByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(trainingSessionId, out _))
        {
            return null;
        }

        return await _context.SessionCompletions
            .AsNoTracking()
            .FirstOrDefaultAsync(
                completion => completion.TrainingSessionId == trainingSessionId,
                cancellationToken);
    }

    public async Task<bool> CreateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default)
    {
        _context.SessionCompletions.Add(completion);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException exception) when (IsDuplicateKey(exception))
        {
            _context.Entry(completion).State = EntityState.Detached;
            return false;
        }
    }

    public async Task<bool> UpdateAsync(
        SessionCompletion completion,
        CancellationToken cancellationToken = default)
    {
        var existing = await _context.SessionCompletions
            .FirstOrDefaultAsync(candidate => candidate.Id == completion.Id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        existing.CompletedAtUtc = completion.CompletedAtUtc;
        existing.ActualIntensity = completion.ActualIntensity;
        existing.PerceivedDifficulty = completion.PerceivedDifficulty;
        existing.RepetitionResults = completion.RepetitionResults;
        existing.Reflection = completion.Reflection;
        existing.CreatedAtUtc = completion.CreatedAtUtc;
        existing.UpdatedAtUtc = completion.UpdatedAtUtc;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteByTrainingSessionIdAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        if (!ObjectId.TryParse(trainingSessionId, out _))
        {
            return false;
        }

        var completion = await _context.SessionCompletions.FirstOrDefaultAsync(
            candidate => candidate.TrainingSessionId == trainingSessionId,
            cancellationToken);
        if (completion is null)
        {
            return false;
        }

        _context.SessionCompletions.Remove(completion);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static bool IsDuplicateKey(Exception exception)
    {
        return exception is MongoWriteException writeException
                && writeException.WriteError.Category == ServerErrorCategory.DuplicateKey
            || exception is MongoBulkWriteException<SessionCompletion> bulkException
                && bulkException.WriteErrors.Any(
                    error => error.Category == ServerErrorCategory.DuplicateKey)
            || exception.InnerException is not null
                && IsDuplicateKey(exception.InnerException);
    }
}
