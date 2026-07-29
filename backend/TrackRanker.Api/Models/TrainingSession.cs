using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TrackRanker.Api.Models;

public sealed class TrainingSession
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public required string Title { get; set; }

    [BsonRepresentation(BsonType.String)]
    public SessionType SessionType { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime SessionDate { get; set; }

    public required string Prescription { get; set; }

    public string? Purpose { get; set; }

    public string? FocusCue { get; set; }

    public string? SuccessCriteria { get; set; }

    public int? IntendedIntensity { get; set; }

    public string? CoachNotes { get; set; }

    [BsonRepresentation(BsonType.String)]
    public TrainingSessionStatus Status { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAtUtc { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAtUtc { get; set; }
}
