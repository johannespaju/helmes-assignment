using DTO;

namespace BLL.Contracts;

public interface IPersonService
{
    Task<PersonDto?> GetAsync(Guid id);

    Task<PersonDto> CreateAsync(PersonDto dto);

    Task<PersonDto?> UpdateAsync(Guid id, PersonDto dto);
}
