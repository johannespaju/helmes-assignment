import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
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

  private readonly people = toSignal(
    this.sectorControl.valueChanges.pipe(
      switchMap((sectorId) => {
        this.status.set('idle');
        if (sectorId === '') {
          return of(null);
        }
        return this.submissionApi.getBySector(sectorId).pipe(
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
    const people = this.people();
    if (people === null) {
      return null;
    }
    const names = this.sectorNames();
    return people.map((person) => ({
      id: person.id,
      name: person.name,
      sectors: person.sectorIds.map((id) => names.get(id)).join(', '),
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
}
