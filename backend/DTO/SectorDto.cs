namespace DTO;

public record SectorDto(Guid Id, string Name, IReadOnlyList<SectorDto> Children);
