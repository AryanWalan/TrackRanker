using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;

namespace TrackRanker.Api.Services;

public sealed class TrainingSessionService : ITrainingSessionService
{
    private readonly ITrainingSessionRepository _repository;

    public TrainingSessionService(ITrainingSessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TrainingSessionResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var sessions = await _repository.GetAllAsync(cancellationToken);
        return sessions.Select(ToResponse).ToList();
    }

    public async Task<TrainingSessionResponse?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        return session is null ? null : ToResponse(session);
    }

    public async Task<TrainingSessionResponse> CreateAsync(
        CreateTrainingSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);
        var now = DateTime.UtcNow;
        var session = new TrainingSession
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Title = ResolveTitle(
                request.Title,
                request.SessionType!.Value,
                request.Prescription),
            SessionType = request.SessionType.Value,
            SessionDate = request.SessionDate!.Value.ToDateTime(
                TimeOnly.MinValue,
                DateTimeKind.Utc),
            Prescription = request.Prescription.Trim(),
            Purpose = TrimOptional(request.Purpose),
            FocusCue = TrimOptional(request.FocusCue),
            SuccessCriteria = TrimOptional(request.SuccessCriteria),
            IntendedIntensity = request.IntendedIntensity,
            CoachNotes = TrimOptional(request.CoachNotes),
            Status = request.Status,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        await _repository.CreateAsync(session, cancellationToken);
        return ToResponse(session);
    }

    public async Task<TrainingSessionResponse?> UpdateAsync(
        string id,
        UpdateTrainingSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);
        var session = await _repository.GetByIdAsync(id, cancellationToken);
        if (session is null)
        {
            return null;
        }

        session.Title = ResolveTitle(
            request.Title,
            request.SessionType!.Value,
            request.Prescription);
        session.SessionType = request.SessionType.Value;
        session.SessionDate = request.SessionDate!.Value.ToDateTime(
            TimeOnly.MinValue,
            DateTimeKind.Utc);
        session.Prescription = request.Prescription.Trim();
        session.Purpose = TrimOptional(request.Purpose);
        session.FocusCue = TrimOptional(request.FocusCue);
        session.SuccessCriteria = TrimOptional(request.SuccessCriteria);
        session.IntendedIntensity = request.IntendedIntensity;
        session.CoachNotes = TrimOptional(request.CoachNotes);
        session.Status = request.Status;
        session.UpdatedAtUtc = DateTime.UtcNow;

        return await _repository.UpdateAsync(session, cancellationToken)
            ? ToResponse(session)
            : null;
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        return _repository.DeleteAsync(id, cancellationToken);
    }

    private static void Validate(object request)
    {
        Validator.ValidateObject(
            request,
            new ValidationContext(request),
            validateAllProperties: true);
    }

    private static string? TrimOptional(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private static string ResolveTitle(
        string? title,
        SessionType sessionType,
        string prescription)
    {
        if (!string.IsNullOrWhiteSpace(title))
        {
            return title.Trim();
        }

        var typeName = System.Text.RegularExpressions.Regex.Replace(
            sessionType.ToString(),
            "([a-z])([A-Z])",
            "$1 $2");
        var generated = $"{typeName} — {prescription.Trim()}";
        return generated.Length <= 100
            ? generated
            : $"{generated[..99].TrimEnd()}…";
    }

    private static TrainingSessionResponse ToResponse(TrainingSession session)
    {
        return new TrainingSessionResponse(
            session.Id,
            session.Title,
            session.SessionType,
            DateOnly.FromDateTime(session.SessionDate),
            session.Prescription,
            session.Purpose,
            session.FocusCue,
            session.SuccessCriteria,
            session.IntendedIntensity,
            session.CoachNotes,
            session.Status,
            session.CreatedAtUtc,
            session.UpdatedAtUtc);
    }
}
