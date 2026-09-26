using BLL.Contracts;
using DTO;

namespace BLL.Services;

public class PersonService : IPersonService
{

    public Task<PersonDto?> GetAsync(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<PersonDto> CreateAsync(PersonDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<PersonDto?> UpdateAsync(Guid id, PersonDto dto)
    {
        throw new NotImplementedException();
    }
}
