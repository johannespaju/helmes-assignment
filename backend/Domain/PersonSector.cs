using Microsoft.EntityFrameworkCore;

namespace Domain;

[PrimaryKey(nameof(PersonId), nameof(SectorId))]
public class PersonSector
{
    public Guid PersonId { get; set; }
    public Person? Person { get; set; }
    
    public Guid SectorId { get; set; }
    [DeleteBehavior(DeleteBehavior.Restrict)] // dont allow deleting sector with associated person(s)
    public Sector? Sector { get; set; }
}
