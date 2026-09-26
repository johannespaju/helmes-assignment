using DAL.Contracts;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories;

public class SectorRepository(AppDbContext db) : ISectorRepository
{
    public async Task<List<Sector>> AllAsync()
    {
        return await db.Sectors
            .OrderBy(s => s.SortOrder)
            .ToListAsync();
    }

    // selectable -> tree leaves/childrenless sectors
    public async Task<int> CountSelectableAsync(IReadOnlyCollection<Guid> ids)
    {
        return await db.Sectors.CountAsync(s => ids.Contains(s.Id) && !s.Children!.Any());
    }
}
