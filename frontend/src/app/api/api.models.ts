export interface SectorDto {
  id: string;
  name: string;
  children: SectorDto[];
}

export interface PersonDto {
  id: string;
  name: string;
  sectorIds: string[];
  agreeToTerms: boolean;
}

export type PersonInput = Omit<PersonDto, 'id'>;
