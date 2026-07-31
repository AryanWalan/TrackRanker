using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Scalar.AspNetCore;
using TrackRanker.Api.Configuration;
using TrackRanker.Api.Repositories;
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
builder.Services.AddScoped<ITrainingSessionRepository, MongoTrainingSessionRepository>();
builder.Services.AddScoped<ITrainingSessionService, TrainingSessionService>();
builder.Services.AddSingleton<ISessionCompletionRepository, MongoSessionCompletionRepository>();
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseCors("Frontend");
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

public partial class Program;
