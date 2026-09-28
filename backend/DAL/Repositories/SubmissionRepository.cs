using DAL.Contracts;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories;

public class SubmissionRepository(AppDbContext db) : ISubmissionRepository
{
    public async Task<Submission?> FindAsync(Guid id)
    {
        return await db.Submissions
            .Include(s => s.SubmissionSectors)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<Submission>> AllWithAnySectorAsync(IReadOnlyCollection<Guid> sectorIds)
    {
        return await db.Submissions
            .Include(s => s.SubmissionSectors)
            .Where(s => s.SubmissionSectors.Any(ss => sectorIds.Contains(ss.SectorId)))
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public void Add(Submission submission)
    {
        db.Submissions.Add(submission);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await db.SaveChangesAsync();
    }
}
