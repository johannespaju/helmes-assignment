using System.ComponentModel.DataAnnotations;

namespace Domain;

public class Sector : BaseEntity
{
    [MaxLength(128)]
    public string Name { get; set; } = default!;

    public int SortOrder { get; set; }

    public Guid? ParentId { get; set; }
    public Sector? Parent { get; set; }

    public ICollection<Sector>? Children { get; set; }

    public ICollection<PersonSector>? PersonSectors { get; set; }
}
