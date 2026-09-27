using Domain;

namespace DAL.Contracts;

public interface ISubmissionRepository
{
    Task<Submission?> FindAsync(Guid id);

    void Add(Submission submission);

    Task<int> SaveChangesAsync();
}
