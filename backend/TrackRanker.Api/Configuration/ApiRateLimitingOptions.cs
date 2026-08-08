using System.ComponentModel.DataAnnotations;

namespace TrackRanker.Api.Configuration;

public sealed class ApiRateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    [Range(1, int.MaxValue)]
    public int ApiPermitLimit { get; init; } = 120;

    [Range(1, int.MaxValue)]
    public int WritePermitLimit { get; init; } = 30;

    [Range(1, 3600)]
    public int WindowSeconds { get; init; } = 60;
}
