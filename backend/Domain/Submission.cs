using System.ComponentModel.DataAnnotations;

namespace Domain;

public class Submission : BaseEntity
{
    [MaxLength(128)]
    public string Name { get; set; } = default!;

    public bool AgreeToTerms { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<SubmissionSector> SubmissionSectors { get; set; } = [];
}
