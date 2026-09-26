using DTO;

namespace BLL.Contracts;

public interface ISectorService
{
    Task<IReadOnlyList<SectorDto>> GetAllAsync();
}
