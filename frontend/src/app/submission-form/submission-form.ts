import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SectorApi } from '../api/sector-api';
import { SubmissionSession } from '../session/submission-session';
import { PersonName } from './person-name/person-name';
import { SectorSelect } from './sector-select/sector-select';
import { TermsCheckbox } from './terms-checkbox/terms-checkbox';

type Status = 'idle' | 'saving' | 'saved' | 'saveFailed' | 'loadFailed';

@Component({
  selector: 'app-submission-form',
  imports: [ReactiveFormsModule, PersonName, SectorSelect, TermsCheckbox],
  templateUrl: './submission-form.html',
  styleUrl: './submission-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionForm {
  private readonly sectorApi = inject(SectorApi);
  private readonly submissionSession = inject(SubmissionSession);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(128)],
    }),
    sectorIds: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
    agreeToTerms: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  protected readonly sectors = toSignal(this.sectorApi.getAll(), { initialValue: [] });
  protected readonly status = signal<Status>('idle');

  constructor() {
    this.submissionSession
      .load()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (submission) => {
          if (submission !== null) {
            this.form.setValue({
              name: submission.name,
              sectorIds: submission.sectorIds,
              agreeToTerms: submission.agreeToTerms,
            });
          }
        },
        error: () => this.status.set('loadFailed'),
      });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('saving');
    this.submissionSession.save(this.form.getRawValue()).subscribe({
      next: () => this.status.set('saved'),
      error: () => this.status.set('saveFailed'),
    });
  }
}
