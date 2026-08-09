using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Scalar.AspNetCore;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Data;
using TrackRanker.Api.Infrastructure;
using TrackRanker.Api.Repositories;
using TrackRanker.Api.Security;
using TrackRanker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddOpenApi();

builder.Services
    .AddOptions<MongoDbOptions>()
    .Bind(builder.Configuration.GetSection(MongoDbOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services
    .AddOptions<E2eOptions>()
    .Bind(builder.Configuration.GetSection(E2eOptions.SectionName));
builder.Services
    .AddOptions<ApiRateLimitingOptions>()
    .Bind(builder.Configuration.GetSection(ApiRateLimitingOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var rateLimits = builder.Configuration
    .GetSection(ApiRateLimitingOptions.SectionName)
    .Get<ApiRateLimitingOptions>() ?? new ApiRateLimitingOptions();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = Math.Ceiling(
                retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
        }

        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Too many requests. Please try again shortly." },
            cancellationToken);
    };

    options.AddPolicy(RateLimitPolicyNames.Api, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientPartitionKey(httpContext),
            _ => CreateFixedWindowOptions(
                rateLimits.ApiPermitLimit,
                rateLimits.WindowSeconds)));
    options.AddPolicy(RateLimitPolicyNames.Write, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientPartitionKey(httpContext),
            _ => CreateFixedWindowOptions(
                rateLimits.WritePermitLimit,
                rateLimits.WindowSeconds)));
});

var e2eEnabled = !builder.Environment.IsProduction()
    && builder.Configuration.GetValue<bool>($"{E2eOptions.SectionName}:Enabled");
var configuredDatabaseName = builder.Configuration[
    $"{MongoDbOptions.SectionName}:DatabaseName"];
if (e2eEnabled && !E2eDataResetService.IsSafeDatabaseName(configuredDatabaseName))
{
    throw new InvalidOperationException(
        "E2E mode requires MongoDb:DatabaseName to end with '_e2e'.");
}

builder.Services.AddSingleton<IMongoClient>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<MongoDbOptions>>().Value;
    return new MongoClient(options.ConnectionString);
});
builder.Services.AddSingleton<IMongoDatabase>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<MongoDbOptions>>().Value;
    return serviceProvider.GetRequiredService<IMongoClient>().GetDatabase(options.DatabaseName);
});
builder.Services.AddDbContext<TrackRankerDbContext>((serviceProvider, options) =>
{
    var mongoOptions = serviceProvider.GetRequiredService<IOptions<MongoDbOptions>>().Value;
    var client = serviceProvider.GetRequiredService<IMongoClient>();
    options.UseMongoDB(client, mongoOptions.DatabaseName);
});
builder.Services.AddHostedService<SessionCompletionIndexInitializer>();
builder.Services.AddScoped<ITrainingSessionRepository, EfTrainingSessionRepository>();
builder.Services.AddScoped<ITrainingSessionService, TrainingSessionService>();
builder.Services.AddScoped<ISessionCompletionRepository, EfSessionCompletionRepository>();
builder.Services.AddScoped<ISessionCompletionService, SessionCompletionService>();
builder.Services.AddScoped<IConfidenceHistoryService, ConfidenceHistoryService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IE2eDataResetService, E2eDataResetService>();

var allowedOrigin = builder.Configuration["Frontend:AllowedOrigin"];
if (string.IsNullOrWhiteSpace(allowedOrigin))
{
    throw new InvalidOperationException(
        "Frontend:AllowedOrigin is required. Set Frontend__AllowedOrigin in the environment.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigin).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.MapOpenApi();
app.MapScalarApiReference();



app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("Frontend");

app.UseRateLimiter();
app.MapControllers();

app.Run();

static string GetClientPartitionKey(HttpContext context)
{
    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown-client";
}

static FixedWindowRateLimiterOptions CreateFixedWindowOptions(
    int permitLimit,
    int windowSeconds)
{
    return new FixedWindowRateLimiterOptions
    {
        AutoReplenishment = true,
        PermitLimit = permitLimit,
        QueueLimit = 0,
        Window = TimeSpan.FromSeconds(windowSeconds)
    };
}

public partial class Program;
