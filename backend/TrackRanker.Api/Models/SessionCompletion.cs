using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TrackRanker.Api.Models;

public sealed class SessionCompletion
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public required string TrainingSessionId { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CompletedAtUtc { get; set; }

    public int ActualIntensity { get; set; }
    public int PerceivedDifficulty { get; set; }
    public List<RepetitionResult> RepetitionResults { get; set; } = [];
    public SessionReflection Reflection { get; set; } = new();

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime CreatedAtUtc { get; set; }

    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAtUtc { get; set; }
}
