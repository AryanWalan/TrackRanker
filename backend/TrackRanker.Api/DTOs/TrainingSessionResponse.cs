using TrackRanker.Api.Models;

namespace TrackRanker.Api.DTOs;

public sealed record TrainingSessionResponse(
    string Id,
    string Title,
    SessionType SessionType,
    DateOnly SessionDate,
    string Prescription,
    string? Purpose,
    string? FocusCue,
    string? SuccessCriteria,
    int? IntendedIntensity,
    string? CoachNotes,
    TrainingSessionStatus Status,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);
