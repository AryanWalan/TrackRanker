namespace TrackRanker.Api.Models;

public sealed class SessionReflection
{
    public string? WentWell { get; set; }
    public string? Improved { get; set; }
    public string? WasDifficult { get; set; }
    public string? NextFocus { get; set; }
    public string? CoachFeedback { get; set; }
    public int? ConfidenceBefore { get; set; }
    public int? ConfidenceAfter { get; set; }
}
