using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;

namespace TrackRanker.Api.Services;

public sealed class ConfidenceHistoryService : IConfidenceHistoryService
{
    private readonly ISessionCompletionRepository _completionRepository;
    private readonly ITrainingSessionRepository _trainingSessionRepository;

    public ConfidenceHistoryService(
        ISessionCompletionRepository completionRepository,
        ITrainingSessionRepository trainingSessionRepository)
    {
        _completionRepository = completionRepository;
        _trainingSessionRepository = trainingSessionRepository;
    }

    public async Task<ConfidenceHistoryResponse> GetHistoryAsync(
        CancellationToken cancellationToken = default)
    {
        var completions = await _completionRepository.GetAllAsync(cancellationToken);
        var sessions = await _trainingSessionRepository.GetAllAsync(cancellationToken);
        var sessionsById = sessions.ToDictionary(session => session.Id);

        var entries = completions
            .Where(HasEvidence)
            .Where(completion => sessionsById.ContainsKey(completion.TrainingSessionId))
            .Select(completion => ToEntry(
                completion,
                sessionsById[completion.TrainingSessionId]))
            .OrderByDescending(entry => entry.SessionDate)
            .ThenByDescending(entry => entry.TrainingSessionId, StringComparer.Ordinal)
            .ToList();

        var pairedEntries = entries
            .Where(entry => entry.ConfidenceBefore.HasValue
                && entry.ConfidenceAfter.HasValue)
            .ToList();
        var beforeValues = entries
            .Where(entry => entry.ConfidenceBefore.HasValue)
            .Select(entry => entry.ConfidenceBefore!.Value)
            .ToList();
        var afterValues = entries
            .Where(entry => entry.ConfidenceAfter.HasValue)
            .Select(entry => entry.ConfidenceAfter!.Value)
            .ToList();

        return new ConfidenceHistoryResponse(
            entries.Count,
            pairedEntries.Count,
            pairedEntries.Count(entry =>
                entry.ConfidenceAfter > entry.ConfidenceBefore),
            AverageOrNull(beforeValues),
            AverageOrNull(afterValues),
            entries);
    }

    private static bool HasEvidence(SessionCompletion completion)
    {
        var reflection = completion.Reflection;
        return reflection.ConfidenceBefore.HasValue
            || reflection.ConfidenceAfter.HasValue
            || HasText(reflection.WentWell)
            || HasText(reflection.Improved)
            || HasText(reflection.WasDifficult)
            || HasText(reflection.NextFocus)
            || HasText(reflection.CoachFeedback);
    }

    private static bool HasText(string? value) => !string.IsNullOrWhiteSpace(value);

    private static double? AverageOrNull(IReadOnlyCollection<int> values)
    {
        return values.Count == 0
            ? null
            : Math.Round(values.Average(), 1, MidpointRounding.AwayFromZero);
    }

    private static ConfidenceHistoryEntryResponse ToEntry(
        SessionCompletion completion,
        TrainingSession session)
    {
        var reflection = completion.Reflection;
        return new ConfidenceHistoryEntryResponse(
            session.Id,
            session.Title,
            session.SessionType,
            DateOnly.FromDateTime(session.SessionDate),
            reflection.ConfidenceBefore,
            reflection.ConfidenceAfter,
            reflection.WentWell,
            reflection.Improved,
            reflection.WasDifficult,
            reflection.NextFocus,
            reflection.CoachFeedback);
    }
}
