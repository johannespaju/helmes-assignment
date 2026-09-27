import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SectorDto } from '../api/api.models';
import { PersonName } from './person-name/person-name';
import { SectorSelect } from './sector-select/sector-select';
import { TermsCheckbox } from './terms-checkbox/terms-checkbox';

// TODO: Page component. Owns the reactive FormGroup (name, sectorIds, agreeToTerms) and its
// validators, loads the sectors and the stored person, and saves through PersonSession.
@Component({
  selector: 'app-person-form',
  imports: [ReactiveFormsModule, PersonName, SectorSelect, TermsCheckbox],
  templateUrl: './person-form.html',
  styleUrl: './person-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonForm {
  // TODO: validators
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    sectorIds: new FormControl<string[]>([], { nonNullable: true }),
    agreeToTerms: new FormControl(false, { nonNullable: true }),
  });

  // TODO: load from SectorApi
  protected readonly sectors = signal<SectorDto[]>([]);
}
