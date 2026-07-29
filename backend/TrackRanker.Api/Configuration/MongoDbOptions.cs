using System.ComponentModel.DataAnnotations;

namespace TrackRanker.Api.Configuration;

public sealed class MongoDbOptions
{
    public const string SectionName = "MongoDb";

    [Required(AllowEmptyStrings = false)]
    public string ConnectionString { get; init; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    public string DatabaseName { get; init; } = string.Empty;
}
