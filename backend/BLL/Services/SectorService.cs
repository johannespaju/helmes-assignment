using BLL.Contracts;
using DAL.Contracts;
using Domain;
using DTO;

namespace BLL.Services;

public class SectorService(ISectorRepository sectorRepository) : ISectorService
{
    public async Task<IReadOnlyList<SectorDto>> GetAllAsync()
    {
        var sectors = await sectorRepository.AllAsync();
        // Start building tree from the root sectors
        return BuildTree(sectors, null);
    }

    private static List<SectorDto> BuildTree(List<Sector> sectors, Guid? parentId)
    {
        var result = new List<SectorDto>();

        foreach (var s in sectors)
        {
            if (s.ParentId != parentId) continue;

            var children = BuildTree(sectors, s.Id);
            result.Add(new SectorDto(s.Id, s.Name, children));
        }

        return result;
    }

    public async Task<bool> AreSelectableAsync(IEnumerable<Guid> sectorIds)
    {
        var ids = sectorIds.ToHashSet();
        if (ids.Count == 0) return false;

        var selectableCount = await sectorRepository.CountSelectableAsync(ids);
        return selectableCount == ids.Count;
    }

    public async Task<IReadOnlyList<Guid>> GetSelfAndDescendantIdsAsync(Guid sectorId)
    {
        var sectors = await sectorRepository.AllAsync();
        if (!sectors.Any(s => s.Id == sectorId)) return [];

        var result = new List<Guid> { sectorId };
        AddDescendantIds(sectors, sectorId, result);
        return result;
    }

    private static void AddDescendantIds(List<Sector> sectors, Guid parentId, List<Guid> result)
    {
        foreach (var s in sectors)
        {
            if (s.ParentId != parentId) continue;

            result.Add(s.Id);
            AddDescendantIds(sectors, s.Id, result);
        }
    }
}
