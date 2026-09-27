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

    public void Add(Submission submission)
    {
        db.Submissions.Add(submission);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await db.SaveChangesAsync();
    }
}
