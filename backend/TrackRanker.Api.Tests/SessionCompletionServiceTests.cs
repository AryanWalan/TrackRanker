using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using TrackRanker.Api.Controllers;
using TrackRanker.Api.DTOs;
using TrackRanker.Api.Models;
using TrackRanker.Api.Repositories;
using TrackRanker.Api.Services;
using Xunit;

namespace TrackRanker.Api.Tests;

public sealed class SessionCompletionServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidRequest_CreatesCompletion()
    {
        var context = TestContextWithParent();

        var result = await context.Service.CreateAsync(
            context.Parent.Id,
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Equal(SessionCompletionOutcome.Success, result.Outcome);
        Assert.NotNull(result.Value);
        Assert.Single(context.Completions.Items);
        Assert.Equal(8, result.Value.ActualIntensity);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidRatings_ThrowsValidationException()
    {
        var context = TestContextWithParent();
        var request = new CreateSessionCompletionRequest
        {
            ActualIntensity = 11,
            PerceivedDifficulty = 0
        };

        await Assert.ThrowsAsync<ValidationException>(() =>
            context.Service.CreateAsync(
                context.Parent.Id,
                request,
                TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task CreateAsync_WithInvalidRepetition_ThrowsValidationException()
    {
        var context = TestContextWithParent();
        var request = new CreateSessionCompletionRequest
        {
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            RepetitionResults =
            [
                new RepetitionResultDto
                {
                    SetNumber = 0,
                    RepetitionNumber = 1,
                    DistanceMetres = 60,
                    TimeSeconds = -1
                }
            ]
        };

        await Assert.ThrowsAsync<ValidationException>(() =>
            context.Service.CreateAsync(
                context.Parent.Id,
                request,
                TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Create_WhenParentDoesNotExist_ReturnsNotFound()
    {
        var service = new SessionCompletionService(
            new FakeSessionCompletionRepository(),
            new FakeTrainingSessionRepository());
        var controller = new SessionCompletionsController(service);

        var response = await controller.Create(
            ObjectId.GenerateNewId().ToString(),
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.IsType<NotFoundResult>(response.Result);
    }

    [Fact]
    public async Task CreateAsync_WhenCompletionExists_ReturnsConflict()
    {
        var context = TestContextWithParent(ExistingCompletion());

        var result = await context.Service.CreateAsync(
            context.Parent.Id,
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Equal(SessionCompletionOutcome.Conflict, result.Outcome);
        Assert.Single(context.Completions.Items);
    }

    [Fact]
    public async Task GetAsync_WhenCompletionExists_ReturnsCompletion()
    {
        var completion = ExistingCompletion();
        var context = TestContextWithParent(completion);

        var result = await context.Service.GetAsync(
            context.Parent.Id,
            TestContext.Current.CancellationToken);

        Assert.Equal(SessionCompletionOutcome.Success, result.Outcome);
        Assert.Equal(completion.Id, result.Value?.Id);
    }

    [Fact]
    public async Task UpdateAsync_ChangesCompletionFields()
    {
        var completion = ExistingCompletion();
        var context = TestContextWithParent(completion);
        var request = ValidUpdateRequest();

        var result = await context.Service.UpdateAsync(
            context.Parent.Id,
            request,
            TestContext.Current.CancellationToken);

        Assert.Equal(SessionCompletionOutcome.Success, result.Outcome);
        Assert.Equal(9, result.Value?.ActualIntensity);
        Assert.Equal("Relaxation improved.", result.Value?.Reflection.Improved);
    }

    [Fact]
    public async Task UpdateAsync_PreservesCreatedAtUtc()
    {
        var completion = ExistingCompletion();
        var originalCreatedAt = completion.CreatedAtUtc;
        var context = TestContextWithParent(completion);

        var result = await context.Service.UpdateAsync(
            context.Parent.Id,
            ValidUpdateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Equal(originalCreatedAt, result.Value?.CreatedAtUtc);
        Assert.True(result.Value?.UpdatedAtUtc > originalCreatedAt);
    }

    [Fact]
    public async Task DeleteAsync_DeletesCompletionOnly()
    {
        var context = TestContextWithParent(ExistingCompletion());

        var outcome = await context.Service.DeleteAsync(
            context.Parent.Id,
            TestContext.Current.CancellationToken);

        Assert.Equal(SessionCompletionOutcome.Success, outcome);
        Assert.Empty(context.Completions.Items);
        Assert.Single(context.TrainingSessions.Items);
        Assert.Equal(context.Parent.Id, context.TrainingSessions.Items[0].Id);
    }

    [Fact]
    public async Task CreateAsync_UpdatesParentStatusToCompleted()
    {
        var context = TestContextWithParent();

        await context.Service.CreateAsync(
            context.Parent.Id,
            ValidCreateRequest(),
            TestContext.Current.CancellationToken);

        Assert.Equal(TrainingSessionStatus.Completed, context.Parent.Status);
        Assert.Equal(1, context.TrainingSessions.UpdateCallCount);
    }

    private static CompletionTestContext TestContextWithParent(
        params SessionCompletion[] completions)
    {
        var parent = ExistingTrainingSession();
        var completionRepository = new FakeSessionCompletionRepository(completions);
        var trainingSessionRepository = new FakeTrainingSessionRepository(parent);
        return new CompletionTestContext(
            parent,
            completionRepository,
            trainingSessionRepository,
            new SessionCompletionService(
                completionRepository,
                trainingSessionRepository));
    }

    private static CreateSessionCompletionRequest ValidCreateRequest()
    {
        return new CreateSessionCompletionRequest
        {
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            RepetitionResults =
            [
                new RepetitionResultDto
                {
                    SetNumber = 1,
                    RepetitionNumber = 1,
                    DistanceMetres = 60,
                    TimeSeconds = 7.42,
                    Notes = "Relaxed."
                }
            ],
            Reflection = new SessionReflectionDto
            {
                WentWell = "Held rhythm.",
                ConfidenceBefore = 3,
                ConfidenceAfter = 4
            }
        };
    }

    private static UpdateSessionCompletionRequest ValidUpdateRequest()
    {
        return new UpdateSessionCompletionRequest
        {
            ActualIntensity = 9,
            PerceivedDifficulty = 8,
            Reflection = new SessionReflectionDto
            {
                Improved = "Relaxation improved.",
                ConfidenceBefore = 3,
                ConfidenceAfter = 5
            }
        };
    }

    private static TrainingSession ExistingTrainingSession()
    {
        var timestamp = DateTime.UtcNow.AddMinutes(-10);
        return new TrainingSession
        {
            Id = ObjectId.GenerateNewId().ToString(),
            Title = "Speed endurance",
            SessionType = SessionType.SpeedEndurance,
            SessionDate = DateTime.UtcNow.Date,
            Prescription = "3 x 150m",
            Status = TrainingSessionStatus.Planned,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private static SessionCompletion ExistingCompletion()
    {
        var timestamp = DateTime.UtcNow.AddMinutes(-5);
        return new SessionCompletion
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TrainingSessionId = string.Empty,
            CompletedAtUtc = timestamp,
            ActualIntensity = 8,
            PerceivedDifficulty = 7,
            CreatedAtUtc = timestamp,
            UpdatedAtUtc = timestamp
        };
    }

    private sealed class CompletionTestContext
    {
        public CompletionTestContext(
            TrainingSession parent,
            FakeSessionCompletionRepository completions,
            FakeTrainingSessionRepository trainingSessions,
            SessionCompletionService service)
        {
            Parent = parent;
            Completions = completions;
            TrainingSessions = trainingSessions;
            Service = service;
            foreach (var completion in completions.Items)
            {
                completion.TrainingSessionId = parent.Id;
            }
        }

        public TrainingSession Parent { get; }
        public FakeSessionCompletionRepository Completions { get; }
        public FakeTrainingSessionRepository TrainingSessions { get; }
        public SessionCompletionService Service { get; }
    }

    private sealed class FakeSessionCompletionRepository : ISessionCompletionRepository
    {
        public FakeSessionCompletionRepository(params SessionCompletion[] completions)
        {
            Items.AddRange(completions);
        }

        public List<SessionCompletion> Items { get; } = [];

        public Task<IReadOnlyList<SessionCompletion>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<SessionCompletion>>(Items);
        }

        public Task<SessionCompletion?> GetByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.SingleOrDefault(
                completion => completion.TrainingSessionId == trainingSessionId));
        }

        public Task<bool> CreateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default)
        {
            if (Items.Any(item => item.TrainingSessionId == completion.TrainingSessionId))
            {
                return Task.FromResult(false);
            }
            Items.Add(completion);
            return Task.FromResult(true);
        }

        public Task<bool> UpdateAsync(
            SessionCompletion completion,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.Any(item => item.Id == completion.Id));
        }

        public Task<bool> DeleteByTrainingSessionIdAsync(
            string trainingSessionId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(
                Items.RemoveAll(item => item.TrainingSessionId == trainingSessionId) == 1);
        }
    }

    private sealed class FakeTrainingSessionRepository : ITrainingSessionRepository
    {
        public FakeTrainingSessionRepository(params TrainingSession[] sessions)
        {
            Items.AddRange(sessions);
        }

        public List<TrainingSession> Items { get; } = [];
        public int UpdateCallCount { get; private set; }

        public Task<IReadOnlyList<TrainingSession>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrainingSession>>(Items);
        }

        public Task<TrainingSession?> GetByIdAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.SingleOrDefault(session => session.Id == id));
        }

        public Task CreateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default)
        {
            Items.Add(session);
            return Task.CompletedTask;
        }

        public Task<bool> UpdateAsync(
            TrainingSession session,
            CancellationToken cancellationToken = default)
        {
            UpdateCallCount++;
            return Task.FromResult(Items.Any(existing => existing.Id == session.Id));
        }

        public Task<bool> DeleteAsync(
            string id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items.RemoveAll(session => session.Id == id) == 1);
        }
    }
}
