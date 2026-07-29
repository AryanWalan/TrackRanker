using System.ComponentModel.DataAnnotations;
using TrackRanker.Api.Models;

namespace TrackRanker.Api.DTOs;

public sealed class CreateTrainingSessionRequest
{
    [StringLength(100)]
    public string? Title { get; init; }

    [Required]
    [EnumDataType(typeof(SessionType))]
    public SessionType? SessionType { get; init; }

    [Required]
    public DateOnly? SessionDate { get; init; }

    [Required]
    [StringLength(1000)]
    public string Prescription { get; init; } = string.Empty;

    [StringLength(1000)]
    public string? Purpose { get; init; }

    [StringLength(500)]
    public string? FocusCue { get; init; }

    [StringLength(500)]
    public string? SuccessCriteria { get; init; }

    [Required]
    [Range(0, 100)]
    public int? IntendedIntensity { get; init; }

    [StringLength(1000)]
    public string? CoachNotes { get; init; }

    [EnumDataType(typeof(TrainingSessionStatus))]
    public TrainingSessionStatus Status { get; init; } = TrainingSessionStatus.Planned;
}
