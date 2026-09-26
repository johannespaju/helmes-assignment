using DAL.Contracts;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace DAL.Repositories;

public class PersonRepository(AppDbContext db) : IPersonRepository
{
    public async Task<Person?> FindAsync(Guid id)
    {
        return await db.Persons
            .Include(p => p.PersonSectors)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public void Add(Person person)
    {
        db.Persons.Add(person);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await db.SaveChangesAsync();
    }
}
