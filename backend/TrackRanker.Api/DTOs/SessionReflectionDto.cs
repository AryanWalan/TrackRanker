using System.ComponentModel.DataAnnotations;

namespace TrackRanker.Api.DTOs;

public sealed class SessionReflectionDto
{
    [StringLength(1000)]
    public string? WentWell { get; init; }

    [StringLength(1000)]
    public string? Improved { get; init; }

    [StringLength(1000)]
    public string? WasDifficult { get; init; }

    [StringLength(1000)]
    public string? NextFocus { get; init; }

    [StringLength(1000)]
    public string? CoachFeedback { get; init; }

    [Range(1, 5)]
    public int? ConfidenceBefore { get; init; }

    [Range(1, 5)]
    public int? ConfidenceAfter { get; init; }
}
