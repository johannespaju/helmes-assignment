import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, of, switchMap } from 'rxjs';
import { SectorDto } from '../api/api.models';
import { SectorApi } from '../api/sector-api';
import { SubmissionApi } from '../api/submission-api';

interface SectorOption {
  id: string;
  name: string;
  label: string;
}

interface PersonRow {
  id: string;
  name: string;
  sectors: string;
}

type Status = 'idle' | 'sectorsLoadFailed' | 'searchFailed';

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
  protected readonly status = signal<Status>('idle');

  private readonly sectors = toSignal(
    this.sectorApi.getAll().pipe(
      catchError(() => {
        this.status.set('sectorsLoadFailed');
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  private readonly search = toSignal(
    this.sectorControl.valueChanges.pipe(
      switchMap((sectorId) => {
        this.status.set('idle');
        if (sectorId === '') {
          return of(null);
        }
        return this.submissionApi.getBySector(sectorId).pipe(
          map((people) => ({ sectorId, people })),
          catchError(() => {
            this.status.set('searchFailed');
            return of(null);
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  protected readonly sectorOptions = computed(() => this.flatten(this.sectors(), 0));

  private readonly sectorNames = computed(
    () => new Map(this.sectorOptions().map((option) => [option.id, option.name])),
  );

  protected readonly rows = computed<PersonRow[] | null>(() => {
    const search = this.search();
    if (search === null) {
      return null;
    }
    const names = this.sectorNames();
    const shownIds = new Set<string>();
    this.collectSelfAndDescendantIds(this.sectors(), search.sectorId, false, shownIds);
    return search.people.map((person) => ({
      id: person.id,
      name: person.name,
      sectors: person.sectorIds
        .filter((id) => shownIds.has(id))
        .map((id) => names.get(id))
        .join(', '),
    }));
  });

  private flatten(sectors: SectorDto[], depth: number): SectorOption[] {
    const options: SectorOption[] = [];
    for (const sector of sectors) {
      const label = ' '.repeat(depth * 4) + sector.name;
      options.push({ id: sector.id, name: sector.name, label });
      options.push(...this.flatten(sector.children, depth + 1));
    }
    return options;
  }

  private collectSelfAndDescendantIds(
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
      this.collectSelfAndDescendantIds(sector.children, sectorId, inside, ids);
    }
  }
}
