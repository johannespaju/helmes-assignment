import { SectorDto } from '../api/api.models';

export interface FlatSector {
  id: string;
  name: string;
  depth: number;
}

export function flattenSectors(sectors: SectorDto[], depth = 0): FlatSector[] {
  const all: FlatSector[] = [];
  for (const sector of sectors) {
    all.push({ id: sector.id, name: sector.name, depth });
    all.push(...flattenSectors(sector.children, depth + 1));
  }
  return all;
}

export function countSelectedDescendants(sector: SectorDto, selectedIds: string[]): number {
  let count = 0;
  for (const child of sector.children) {
    if (selectedIds.includes(child.id)) {
      count++;
    }
    count += countSelectedDescendants(child, selectedIds);
  }
  return count;
}

export function selfAndDescendantIds(sectors: SectorDto[], sectorId: string): Set<string> {
  const ids = new Set<string>();
  collectSelfAndDescendantIds(sectors, sectorId, false, ids);
  return ids;
}

function collectSelfAndDescendantIds(
  sectors: SectorDto[],
  sectorId: string,
  insideSector: boolean,
  ids: Set<string>,
): void {
  for (const sector of sectors) {
    const inside = insideSector || sector.id === sectorId;
    if (inside) {
      ids.add(sector.id);
    }
    collectSelfAndDescendantIds(sector.children, sectorId, inside, ids);
  }
}
