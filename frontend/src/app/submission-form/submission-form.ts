import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { SubmissionDto } from '../api/api.models';
import { SectorApi } from '../api/sector-api';
import { SubmissionSession } from '../session/submission-session';
import { PersonName } from './person-name/person-name';
import { SectorSelect } from './sector-select/sector-select';
import { TermsCheckbox } from './terms-checkbox/terms-checkbox';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';

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

  protected readonly sectorsLoadFailed = signal(false);
  protected readonly submissionLoadFailed = signal(false);
  protected readonly saveState = signal<SaveState>('idle');
  protected readonly sectors = toSignal(
    this.sectorApi.getAll().pipe(
      catchError(() => {
        this.sectorsLoadFailed.set(true);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  constructor() {
    this.submissionSession
      .load()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (submission) => {
          if (submission !== null) {
            this.fill(submission);
          }
        },
        error: () => this.submissionLoadFailed.set(true),
      });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.saveState() === 'saved' || this.saveState() === 'failed') {
        this.saveState.set('idle');
      }
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saveState.set('saving');
    this.submissionSession.save(this.form.getRawValue()).subscribe({
      next: (submission) => {
        this.fill(submission);
        this.saveState.set('saved');
      },
      error: () => this.saveState.set('failed'),
    });
  }

  private fill(submission: SubmissionDto): void {
    this.form.setValue({
      name: submission.name,
      sectorIds: submission.sectorIds,
      agreeToTerms: submission.agreeToTerms,
    });
  }
}
