using DTO;

namespace BLL.Contracts;

public interface ISectorService
{
    Task<IReadOnlyList<SectorDto>> GetAllAsync();

    Task<bool> AreSelectableAsync(IEnumerable<Guid> sectorIds);
}
