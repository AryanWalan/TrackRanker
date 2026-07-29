using System.ComponentModel.DataAnnotations;

namespace TrackRanker.Api.DTOs;

public sealed class UpdateSessionCompletionRequest
{
    [Range(1, 10)]
    public int ActualIntensity { get; init; }

    [Range(1, 10)]
    public int PerceivedDifficulty { get; init; }

    public IReadOnlyList<RepetitionResultDto> RepetitionResults { get; init; } = [];

    public SessionReflectionDto Reflection { get; init; } = new();
}
