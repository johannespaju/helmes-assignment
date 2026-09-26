using Domain;

namespace DAL.Contracts;

public interface ISectorRepository
{
    Task<List<Sector>> AllAsync();

    Task<int> CountSelectableAsync(IReadOnlyCollection<Guid> ids);
}
