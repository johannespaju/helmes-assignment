/** A sector node. Only leaf sectors (empty `children`) can be selected. */
export interface SectorDto {
  id: string;
  name: string;
  children: SectorDto[];
}

/** A person with their selected sectors. `id` is ignored on create. */
export interface PersonDto {
  id: string;
  name: string;
  sectorIds: string[];
  agreeToTerms: boolean;
}
