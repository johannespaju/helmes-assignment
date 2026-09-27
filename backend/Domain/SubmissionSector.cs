using Microsoft.EntityFrameworkCore;

namespace Domain;

[PrimaryKey(nameof(SubmissionId), nameof(SectorId))]
public class SubmissionSector
{
    public Guid SubmissionId { get; set; }
    public Submission? Submission { get; set; }
    
    public Guid SectorId { get; set; }
    [DeleteBehavior(DeleteBehavior.Restrict)] // dont allow deleting sector with associated submission(s)
    public Sector? Sector { get; set; }
}
