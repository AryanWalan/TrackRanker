using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.Data;

internal sealed class SessionCompletionConfiguration : IEntityTypeConfiguration<SessionCompletion>
{
    public void Configure(EntityTypeBuilder<SessionCompletion> builder)
    {
        builder.ToCollection("sessionCompletions");
        builder.HasKey(completion => completion.Id);

        builder.Property(completion => completion.Id).IsRequired();
        builder.Property(completion => completion.TrainingSessionId).IsRequired();

        builder.OwnsMany(completion => completion.RepetitionResults, repetitions =>
        {
            repetitions.Property(result => result.Notes).IsRequired(false);
        });

        builder.OwnsOne(completion => completion.Reflection, reflection =>
        {
            reflection.Property(value => value.WentWell).IsRequired(false);
            reflection.Property(value => value.Improved).IsRequired(false);
            reflection.Property(value => value.WasDifficult).IsRequired(false);
            reflection.Property(value => value.NextFocus).IsRequired(false);
            reflection.Property(value => value.CoachFeedback).IsRequired(false);
            reflection.Property(value => value.ConfidenceBefore).IsRequired(false);
            reflection.Property(value => value.ConfidenceAfter).IsRequired(false);
        });
    }
}
