using Domain;

namespace DAL.Contracts;

public interface ISubmissionRepository
{
    Task<Submission?> FindAsync(Guid id);

    Task<List<Submission>> AllWithAnySectorAsync(IReadOnlyCollection<Guid> sectorIds);

    void Add(Submission submission);

    Task<int> SaveChangesAsync();
}
