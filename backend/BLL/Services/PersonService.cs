using BLL.Contracts;
using DAL.Contracts;
using Domain;
using DTO;

namespace BLL.Services;

public class PersonService(IPersonRepository personRepository) : IPersonService
{
    public async Task<PersonDto?> GetAsync(Guid id)
    {
        var person = await personRepository.FindAsync(id);
        return person is null ? null : ToDto(person);
    }

    public async Task<PersonDto> CreateAsync(PersonDto dto)
    {
        var now = DateTime.UtcNow;
        var person = new Person
        {
            Name = dto.Name.Trim(),
            AgreeToTerms = dto.AgreeToTerms,
            CreatedAt = now,
            UpdatedAt = now,
            PersonSectors = dto.SectorIds.Distinct().Select(sectorId => new PersonSector { SectorId = sectorId }).ToList()
        };

        personRepository.Add(person);
        await personRepository.SaveChangesAsync();

        return ToDto(person);
    }

    public async Task<PersonDto?> UpdateAsync(Guid id, PersonDto dto)
    {
        var person = await personRepository.FindAsync(id);
        if (person is null) return null;

        person.Name = dto.Name.Trim();
        person.AgreeToTerms = dto.AgreeToTerms;
        person.UpdatedAt = DateTime.UtcNow;

        var sectorIds = dto.SectorIds.ToHashSet();
        foreach (var personSector in person.PersonSectors.ToList())
        {
            var wasInNewSelection = sectorIds.Remove(personSector.SectorId);
            
            if (!wasInNewSelection)
            {
                person.PersonSectors.Remove(personSector);
            }
        }

        foreach (var sectorId in sectorIds)
        {
            person.PersonSectors.Add(new PersonSector { SectorId = sectorId });
        }

        await personRepository.SaveChangesAsync();

        return ToDto(person);
    }

    private static PersonDto ToDto(Person person) => new(
        person.Id,
        person.Name,
        person.PersonSectors.Select(ps => ps.SectorId).ToList(),
        person.AgreeToTerms);
}
