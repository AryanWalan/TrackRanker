using System.ComponentModel.DataAnnotations;

namespace TrackRanker.Api.DTOs;

public sealed class RepetitionResultDto
{
    [Range(1, int.MaxValue)]
    public int SetNumber { get; init; }

    [Range(1, int.MaxValue)]
    public int RepetitionNumber { get; init; }

    [Range(double.Epsilon, double.MaxValue)]
    public double DistanceMetres { get; init; }

    [Range(double.Epsilon, double.MaxValue)]
    public double TimeSeconds { get; init; }

    [StringLength(500)]
    public string? Notes { get; init; }
}
