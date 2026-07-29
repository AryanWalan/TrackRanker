using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Scalar.AspNetCore;
using TrackRanker.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services
    .AddOptions<MongoDbOptions>()
    .Bind(builder.Configuration.GetSection(MongoDbOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

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
