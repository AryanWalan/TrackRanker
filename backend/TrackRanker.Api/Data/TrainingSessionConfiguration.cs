using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Data;

internal sealed class TrainingSessionConfiguration : IEntityTypeConfiguration<TrainingSession>
{
    public void Configure(EntityTypeBuilder<TrainingSession> builder)
    {
        builder.ToCollection("trainingSessions");
        builder.HasKey(session => session.Id);

        builder.Property(session => session.Id).IsRequired();
        builder.Property(session => session.Title).IsRequired();
        builder.Property(session => session.Prescription).IsRequired();
        builder.Property(session => session.Purpose).IsRequired(false);
        builder.Property(session => session.FocusCue).IsRequired(false);
        builder.Property(session => session.SuccessCriteria).IsRequired(false);
        builder.Property(session => session.IntendedIntensity).IsRequired(false);
        builder.Property(session => session.CoachNotes).IsRequired(false);
    }
}
