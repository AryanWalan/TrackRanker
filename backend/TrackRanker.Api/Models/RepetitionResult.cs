namespace TrackRanker.Api.Models;

public sealed class RepetitionResult
{
    public int SetNumber { get; set; }
    public int RepetitionNumber { get; set; }
    public double DistanceMetres { get; set; }
    public double TimeSeconds { get; set; }
    public string? Notes { get; set; }
}
