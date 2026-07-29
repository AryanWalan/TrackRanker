using TrackRanker.Api.Models;

namespace TrackRanker.Api.DTOs;

public sealed record ConfidenceHistoryResponse(
    int TotalReflectedSessions,
    int SessionsWithConfidence,
    int SessionsImproved,
    double? AverageConfidenceBefore,
    double? AverageConfidenceAfter,
    IReadOnlyList<ConfidenceHistoryEntryResponse> Entries);

public sealed record ConfidenceHistoryEntryResponse(
    string TrainingSessionId,
    string SessionTitle,
    SessionType SessionType,
    DateOnly SessionDate,
    int? ConfidenceBefore,
    int? ConfidenceAfter,
    string? WentWell,
    string? Improved,
    string? WasDifficult,
    string? NextFocus,
    string? CoachFeedback);
