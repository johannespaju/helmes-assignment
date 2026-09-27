import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SectorApi } from '../api/sector-api';
import { PersonName } from './person-name/person-name';
import { SectorSelect } from './sector-select/sector-select';
import { TermsCheckbox } from './terms-checkbox/terms-checkbox';

// TODO: load the stored person and save through PersonSession.
@Component({
  selector: 'app-person-form',
  imports: [ReactiveFormsModule, PersonName, SectorSelect, TermsCheckbox],
  templateUrl: './person-form.html',
  styleUrl: './person-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonForm {
  private readonly sectorApi = inject(SectorApi);

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
}
