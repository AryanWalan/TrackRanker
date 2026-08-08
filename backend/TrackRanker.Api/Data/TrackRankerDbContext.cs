using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Data;

public sealed class TrackRankerDbContext : DbContext
{
    private readonly bool _useTransactions;

    public TrackRankerDbContext(
        DbContextOptions<TrackRankerDbContext> options,
        IOptions<MongoDbOptions> mongoOptions)
        : base(options)
    {
        _useTransactions = mongoOptions.Value.UseTransactions;
    }

    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();

    public DbSet<SessionCompletion> SessionCompletions => Set<SessionCompletion>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        Database.AutoTransactionBehavior = _useTransactions
            ? AutoTransactionBehavior.WhenNeeded
            : AutoTransactionBehavior.Never;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new TrainingSessionConfiguration());
        modelBuilder.ApplyConfiguration(new SessionCompletionConfiguration());
    }
}
