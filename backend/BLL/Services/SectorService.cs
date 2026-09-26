using BLL.Contracts;
using DTO;

namespace BLL.Services;

public class SectorService : ISectorService
{
    public Task<IReadOnlyList<SectorDto>> GetAllAsync()
    {
        throw new NotImplementedException();
    }
}
