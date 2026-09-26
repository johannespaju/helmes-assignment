using Domain;

namespace DAL.Contracts;

public interface IPersonRepository
{
    Task<Person?> FindAsync(Guid id);

    void Add(Person person);

    Task<int> SaveChangesAsync();
}
