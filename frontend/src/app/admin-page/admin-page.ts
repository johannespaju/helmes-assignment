import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, of, switchMap } from 'rxjs';
import { SectorApi } from '../api/sector-api';
import { SubmissionApi } from '../api/submission-api';
import { flattenSectors, selfAndDescendantIds } from '../sectors/sector-tree';

interface SectorOption {
  id: string;
  label: string;
}

interface PersonRow {
  id: string;
  name: string;
  sectors: string;
}

@Component({
  selector: 'app-admin-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  private readonly sectorApi = inject(SectorApi);
  private readonly submissionApi = inject(SubmissionApi);

  protected readonly sectorControl = new FormControl('', { nonNullable: true });
  protected readonly sectorsLoadFailed = signal(false);
  protected readonly searchFailed = signal(false);

  private readonly sectors = toSignal(
    this.sectorApi.getAll().pipe(
      catchError(() => {
        this.sectorsLoadFailed.set(true);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  private readonly search = toSignal(
    this.sectorControl.valueChanges.pipe(
      switchMap((sectorId) => {
        this.searchFailed.set(false);
        if (sectorId === '') {
          return of(null);
        }
        return this.submissionApi.getBySector(sectorId).pipe(
          map((people) => ({ sectorId, people })),
          catchError(() => {
            this.searchFailed.set(true);
            return of(null);
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  private readonly flatSectors = computed(() => flattenSectors(this.sectors()));

  protected readonly sectorOptions = computed<SectorOption[]>(() =>
    this.flatSectors().map((sector) => ({
      id: sector.id,
      label: ' '.repeat(sector.depth * 4) + sector.name,
    })),
  );

  private readonly sectorNames = computed(
    () => new Map(this.flatSectors().map((sector) => [sector.id, sector.name])),
  );

  protected readonly rows = computed<PersonRow[] | null>(() => {
    const search = this.search();
    if (search === null) {
      return null;
    }
    const names = this.sectorNames();
    const shownIds = selfAndDescendantIds(this.sectors(), search.sectorId);
    return search.people.map((person) => ({
      id: person.id,
      name: person.name,
      sectors: person.sectorIds
        .filter((id) => shownIds.has(id))
        .map((id) => names.get(id))
        .join(', '),
    }));
  });
}
