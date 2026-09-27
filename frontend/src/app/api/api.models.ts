export interface SectorDto {
  id: string;
  name: string;
  children: SectorDto[];
}

export interface SubmissionDto {
  id: string;
  name: string;
  sectorIds: string[];
  agreeToTerms: boolean;
}

export type SubmissionInput = Omit<SubmissionDto, 'id'>;
