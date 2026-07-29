using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class TrainingSessionServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidRequest_CreatesSession()
    {
        var repository = new FakeTrainingSessionRepository();
        var service = new TrainingSessionService(repository);

        var response = await service.CreateAsync(
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Single(repository.Sessions);
        Assert.Equal("Acceleration focus", response.Title);
        Assert.Equal(TrainingSessionStatus.Planned, response.Status);
        Assert.Equal(response.CreatedAtUtc, response.UpdatedAtUtc);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidRequest_ThrowsValidationException()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());
        var request = new CreateTrainingSessionRequest
        {
            Title = string.Empty,
            SessionType = SessionType.Acceleration,
            SessionDate = new DateOnly(2026, 8, 1),
            Prescription = "3 x 30m block starts"
        };

        await Assert.ThrowsAsync<ValidationException>(() =>
            service.CreateAsync(request, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetByIdAsync_WhenSessionExists_ReturnsSession()
    {
        var existing = ExistingSession();
        var repository = new FakeTrainingSessionRepository(existing);
        var service = new TrainingSessionService(repository);

        var response = await service.GetByIdAsync(
            existing.Id,
            TestContext.Current.CancellationToken);

        Assert.NotNull(response);
        Assert.Equal(existing.Title, response.Title);
    }

    [Fact]
    public async Task GetByIdAsync_WhenSessionDoesNotExist_ReturnsNull()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());

        var response = await service.GetByIdAsync(
            ObjectId.GenerateNewId().ToString(),
            TestContext.Current.CancellationToken);

        Assert.Null(response);
    }

    [Fact]
    public async Task UpdateAsync_ChangesEditableFieldsAndPreservesCreatedTimestamp()
    {
        var existing = ExistingSession();
        var createdAt = existing.CreatedAtUtc;
        var repository = new FakeTrainingSessionRepository(existing);
        var service = new TrainingSessionService(repository);
        var request = new UpdateTrainingSessionRequest
        {
            Title = "Updated max velocity",
            SessionType = SessionType.MaxVelocity,
            SessionDate = new DateOnly(2026, 8, 2),
            Prescription = "4 x flying 30m",
            Purpose = "Develop upright speed.",
            IntendedIntensity = 95,
            Status = TrainingSessionStatus.Completed
        };

        var response = await service.UpdateAsync(
            existing.Id,
            request,
            TestContext.Current.CancellationToken);

        Assert.NotNull(response);
        Assert.Equal("Updated max velocity", response.Title);
        Assert.Equal(SessionType.MaxVelocity, response.SessionType);
        Assert.Equal(createdAt, response.CreatedAtUtc);
        Assert.True(response.UpdatedAtUtc >= createdAt);
    }

    [Fact]
    public async Task DeleteAsync_CallsRepositoryDelete()
    {
        var existing = ExistingSession();
        var repository = new FakeTrainingSessionRepository(existing);
        var service = new TrainingSessionService(repository);

        var deleted = await service.DeleteAsync(
            existing.Id,
            TestContext.Current.CancellationToken);

        Assert.True(deleted);
        Assert.Equal(1, repository.DeleteCallCount);
        Assert.Empty(repository.Sessions);
    }

    [Fact]
    public async Task CreateAsync_WithEssentialFieldsOnly_Succeeds()
    {
        var repository = new FakeTrainingSessionRepository();
        var service = new TrainingSessionService(repository);
        var request = new CreateTrainingSessionRequest
        {
            SessionType = SessionType.Acceleration,
            SessionDate = new DateOnly(2026, 8, 4),
            Prescription = "4 × 30m",
            IntendedIntensity = 95
        };

        var response = await service.CreateAsync(
            request,
            TestContext.Current.CancellationToken);

        Assert.Equal("Acceleration — 4 × 30m", response.Title);
        Assert.Null(response.Purpose);
        Assert.Null(response.FocusCue);
        Assert.Null(response.SuccessCriteria);
        Assert.Null(response.CoachNotes);
    }

    [Fact]
    public async Task CreateAsync_WithOptionalClarityOmitted_StoresNullValues()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());
        var request = ValidCreateRequest();

        var response = await service.CreateAsync(
            new CreateTrainingSessionRequest
            {
                SessionType = request.SessionType,
                SessionDate = request.SessionDate,
                Prescription = request.Prescription,
                IntendedIntensity = request.IntendedIntensity
            },
            TestContext.Current.CancellationToken);

        Assert.Null(response.Purpose);
        Assert.Null(response.FocusCue);
        Assert.Null(response.SuccessCriteria);
        Assert.Null(response.CoachNotes);
    }

    [Fact]
    public async Task CreateAsync_WithClarityFields_PreservesClarity()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());

        var response = await service.CreateAsync(
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Equal("Develop projection from the blocks.", response.Purpose);
        Assert.Equal("Push long and stay patient.", response.FocusCue);
    }

    [Fact]
    public async Task UpdateAsync_CanAddClarityLater()
    {
        var existing = ExistingSession();
        var service = new TrainingSessionService(
            new FakeTrainingSessionRepository(existing));

        var response = await service.UpdateAsync(
            existing.Id,
            ValidUpdateRequest(
                purpose: "Develop upright mechanics.",
                focusCue: "Run tall and relaxed."),
            TestContext.Current.CancellationToken);

        Assert.Equal("Develop upright mechanics.", response?.Purpose);
        Assert.Equal("Run tall and relaxed.", response?.FocusCue);
    }

    [Fact]
    public async Task UpdateAsync_CanRemoveOptionalClarity()
    {
        var existing = ExistingSession();
        existing.Purpose = "Existing purpose";
        existing.FocusCue = "Existing focus";
        existing.SuccessCriteria = "Existing success criteria";
        existing.CoachNotes = "Existing notes";
        var service = new TrainingSessionService(
            new FakeTrainingSessionRepository(existing));

        var response = await service.UpdateAsync(
            existing.Id,
            ValidUpdateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Null(response?.Purpose);
        Assert.Null(response?.FocusCue);
        Assert.Null(response?.SuccessCriteria);
        Assert.Null(response?.CoachNotes);
    }

    [Fact]
    public async Task CreateAsync_StillValidatesRequiredEssentialFields()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());
        var invalidRequests = new[]
        {
            new CreateTrainingSessionRequest
            {
                SessionType = SessionType.Tempo,
                Prescription = "6 × 100m",
                IntendedIntensity = 70
            },
            new CreateTrainingSessionRequest
            {
                SessionType = SessionType.Tempo,
                SessionDate = new DateOnly(2026, 8, 4),
                Prescription = string.Empty,
                IntendedIntensity = 70
            },
            new CreateTrainingSessionRequest
            {
                SessionType = SessionType.Tempo,
                SessionDate = new DateOnly(2026, 8, 4),
                Prescription = "6 × 100m"
            }
        };

        foreach (var request in invalidRequests)
        {
            await Assert.ThrowsAsync<ValidationException>(() =>
                service.CreateAsync(
                    request,
                    TestContext.Current.CancellationToken));
        }
    }

    [Fact]
    public async Task CreateAsync_WithFullyPopulatedLegacyPayload_RemainsCompatible()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());
        var request = new CreateTrainingSessionRequest
        {
            Title = "Coach's speed session",
            SessionType = SessionType.SpeedEndurance,
            SessionDate = new DateOnly(2026, 8, 5),
            Prescription = "3 × 150m",
            Purpose = "Maintain speed under fatigue.",
            FocusCue = "Stay relaxed.",
            SuccessCriteria = "Consistent technique.",
            IntendedIntensity = 90,
            CoachNotes = "Ten minutes recovery.",
            Status = TrainingSessionStatus.Planned
        };

        var response = await service.CreateAsync(
            request,
            TestContext.Current.CancellationToken);

        Assert.Equal(request.Title, response.Title);
        Assert.Equal(request.Purpose, response.Purpose);
        Assert.Equal(request.CoachNotes, response.CoachNotes);
    }

    [Fact]
    public async Task CreateAsync_WithBlankTitle_GeneratesPredictableTrimmedTitle()
    {
        var service = new TrainingSessionService(new FakeTrainingSessionRepository());
        var request = new CreateTrainingSessionRequest
        {
            Title = "  ",
            SessionType = SessionType.MaxVelocity,
            SessionDate = new DateOnly(2026, 8, 6),
            Prescription = "5 × 30m Fly",
            IntendedIntensity = 98
        };

        var response = await service.CreateAsync(
            request,
            TestContext.Current.CancellationToken);

        Assert.Equal("Max Velocity — 5 × 30m Fly", response.Title);
    }

    private static CreateTrainingSessionRequest ValidCreateRequest()
    {
        return new CreateTrainingSessionRequest
        {
            Title = "  Acceleration focus  ",
            SessionType = SessionType.Acceleration,
            SessionDate = new DateOnly(2026, 8, 1),
            Prescription = "3 x 30m block starts",
            Purpose = "Develop projection from the blocks.",
            FocusCue = "Push long and stay patient.",
            IntendedIntensity = 95
        };
    }

    private static UpdateTrainingSessionRequest ValidUpdateRequest(
        string? purpose = null,
        string? focusCue = null)
    {
        return new UpdateTrainingSessionRequest
        {
            SessionType = SessionType.MaxVelocity,
            SessionDate = new DateOnly(2026, 8, 2),
            Prescription = "4 × flying 30m",
            IntendedIntensity = 95,
            Purpose = purpose,
            FocusCue = focusCue,
            Status = TrainingSessionStatus.Planned
        };
    }

    private static TrainingSession ExistingSession()
    {
        var timestamp = DateTime.UtcNow.AddMinutes(-5);
        return new TrainingSession
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Title = "Starts",
            SessionType = SessionType.Starts,
            SessionDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
            Prescription = "4 x 20m block starts",
            Status = TrainingSessionStatus.Planned,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private sealed class FakeTrainingSessionRepository : ITrainingSessionRepository
    {
        public FakeTrainingSessionRepository(params TrainingSession[] sessions)
        {
            Sessions.AddRange(sessions);
        }

        public List<TrainingSession> Sessions { get; } = [];
        public int DeleteCallCount { get; private set; }

        public Task<IReadOnlyList<TrainingSession>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrainingSession>>(
                Sessions.OrderByDescending(session => session.SessionDate).ToList());
        }

        public Task<TrainingSession?> GetByIdAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Sessions.SingleOrDefault(session => session.Id == id));
        }

        public Task CreateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default)
        {
            Sessions.Add(session);
            return Task.CompletedTask;
        }

        public Task<bool> UpdateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Sessions.Any(existing => existing.Id == session.Id));
        }

        public Task<bool> DeleteAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            DeleteCallCount++;
            return Task.FromResult(Sessions.RemoveAll(session => session.Id == id) == 1);
        }
    }
}
