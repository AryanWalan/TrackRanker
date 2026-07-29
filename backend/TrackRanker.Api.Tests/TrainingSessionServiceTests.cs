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
