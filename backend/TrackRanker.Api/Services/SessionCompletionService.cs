using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;

namespace TrackRanker.Api.Services;

public sealed class SessionCompletionService : ISessionCompletionService
{
    private readonly ISessionCompletionRepository _completionRepository;
    private readonly ITrainingSessionRepository _trainingSessionRepository;

    public SessionCompletionService(
        ISessionCompletionRepository completionRepository,
        ITrainingSessionRepository trainingSessionRepository)
    {
        _completionRepository = completionRepository;
        _trainingSessionRepository = trainingSessionRepository;
    }

    public async Task<SessionCompletionOperation<SessionCompletionResponse>> GetAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        if (await _trainingSessionRepository.GetByIdAsync(
                trainingSessionId,
                cancellationToken) is null)
        {
            return new(SessionCompletionOutcome.ParentNotFound);
        }

        var completion = await _completionRepository.GetByTrainingSessionIdAsync(
            trainingSessionId,
            cancellationToken);
        return completion is null
            ? new(SessionCompletionOutcome.CompletionNotFound)
            : new(SessionCompletionOutcome.Success, ToResponse(completion));
    }

    public async Task<SessionCompletionOperation<SessionCompletionResponse>> CreateAsync(
        string trainingSessionId,
        CreateSessionCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request, request.RepetitionResults, request.Reflection);
        var trainingSession = await _trainingSessionRepository.GetByIdAsync(
            trainingSessionId,
            cancellationToken);
        if (trainingSession is null)
        {
            return new(SessionCompletionOutcome.ParentNotFound);
        }

        if (await _completionRepository.GetByTrainingSessionIdAsync(
                trainingSessionId,
                cancellationToken) is not null)
        {
            return new(SessionCompletionOutcome.Conflict);
        }

        var now = UtcNowAtMongoPrecision();
        var completion = new SessionCompletion
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TrainingSessionId = trainingSessionId,
            CompletedAtUtc = now,
            ActualIntensity = request.ActualIntensity,
            PerceivedDifficulty = request.PerceivedDifficulty,
            RepetitionResults = request.RepetitionResults.Select(ToModel).ToList(),
            Reflection = ToModel(request.Reflection),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (!await _completionRepository.CreateAsync(completion, cancellationToken))
        {
            return new(SessionCompletionOutcome.Conflict);
        }

        trainingSession.Status = TrainingSessionStatus.Completed;
        trainingSession.UpdatedAtUtc = now;
        await _trainingSessionRepository.UpdateAsync(trainingSession, cancellationToken);

        return new(SessionCompletionOutcome.Success, ToResponse(completion));
    }

    public async Task<SessionCompletionOperation<SessionCompletionResponse>> UpdateAsync(
        string trainingSessionId,
        UpdateSessionCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request, request.RepetitionResults, request.Reflection);
        if (await _trainingSessionRepository.GetByIdAsync(
                trainingSessionId,
                cancellationToken) is null)
        {
            return new(SessionCompletionOutcome.ParentNotFound);
        }

        var completion = await _completionRepository.GetByTrainingSessionIdAsync(
            trainingSessionId,
            cancellationToken);
        if (completion is null)
        {
            return new(SessionCompletionOutcome.CompletionNotFound);
        }

        completion.ActualIntensity = request.ActualIntensity;
        completion.PerceivedDifficulty = request.PerceivedDifficulty;
        completion.RepetitionResults = request.RepetitionResults.Select(ToModel).ToList();
        completion.Reflection = ToModel(request.Reflection);
        completion.UpdatedAtUtc = UtcNowAtMongoPrecision();

        return await _completionRepository.UpdateAsync(completion, cancellationToken)
            ? new(SessionCompletionOutcome.Success, ToResponse(completion))
            : new(SessionCompletionOutcome.CompletionNotFound);
    }

    public async Task<SessionCompletionOutcome> DeleteAsync(
        string trainingSessionId,
        CancellationToken cancellationToken = default)
    {
        if (await _trainingSessionRepository.GetByIdAsync(
                trainingSessionId,
                cancellationToken) is null)
        {
            return SessionCompletionOutcome.ParentNotFound;
        }

        return await _completionRepository.DeleteByTrainingSessionIdAsync(
            trainingSessionId,
            cancellationToken)
            ? SessionCompletionOutcome.Success
            : SessionCompletionOutcome.CompletionNotFound;
    }

    private static void Validate(
        object request,
        IEnumerable<RepetitionResultDto> repetitions,
        SessionReflectionDto reflection)
    {
        Validator.ValidateObject(request, new ValidationContext(request), true);
        foreach (var repetition in repetitions)
        {
            Validator.ValidateObject(repetition, new ValidationContext(repetition), true);
        }
        Validator.ValidateObject(reflection, new ValidationContext(reflection), true);
    }

    private static RepetitionResult ToModel(RepetitionResultDto result)
    {
        return new RepetitionResult
        {
            SetNumber = result.SetNumber,
            RepetitionNumber = result.RepetitionNumber,
            DistanceMetres = result.DistanceMetres,
            TimeSeconds = result.TimeSeconds,
            Notes = TrimOptional(result.Notes)
        };
    }

    private static SessionReflection ToModel(SessionReflectionDto reflection)
    {
        return new SessionReflection
        {
            WentWell = TrimOptional(reflection.WentWell),
            Improved = TrimOptional(reflection.Improved),
            WasDifficult = TrimOptional(reflection.WasDifficult),
            NextFocus = TrimOptional(reflection.NextFocus),
            CoachFeedback = TrimOptional(reflection.CoachFeedback),
            ConfidenceBefore = reflection.ConfidenceBefore,
            ConfidenceAfter = reflection.ConfidenceAfter
        };
    }

    private static string? TrimOptional(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static DateTime UtcNowAtMongoPrecision()
    {
        var now = DateTime.UtcNow;
        return new DateTime(
            now.Ticks - now.Ticks % TimeSpan.TicksPerMillisecond,
            DateTimeKind.Utc);
    }

    private static SessionCompletionResponse ToResponse(SessionCompletion completion)
    {
        return new SessionCompletionResponse(
            completion.Id,
            completion.TrainingSessionId,
            completion.CompletedAtUtc,
            completion.ActualIntensity,
            completion.PerceivedDifficulty,
            completion.RepetitionResults.Select(result => new RepetitionResultDto
            {
                SetNumber = result.SetNumber,
                RepetitionNumber = result.RepetitionNumber,
                DistanceMetres = result.DistanceMetres,
                TimeSeconds = result.TimeSeconds,
                Notes = result.Notes
            }).ToList(),
            new SessionReflectionDto
            {
                WentWell = completion.Reflection.WentWell,
                Improved = completion.Reflection.Improved,
                WasDifficult = completion.Reflection.WasDifficult,
                NextFocus = completion.Reflection.NextFocus,
                CoachFeedback = completion.Reflection.CoachFeedback,
                ConfidenceBefore = completion.Reflection.ConfidenceBefore,
                ConfidenceAfter = completion.Reflection.ConfidenceAfter
            },
            completion.CreatedAtUtc,
            completion.UpdatedAtUtc);
    }
}
