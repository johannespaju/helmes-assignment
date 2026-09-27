import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SectorDto } from '../../api/api.models';

// TODO: Nested sector checkbox tree (only leaf sectors selectable), matching reference/index.html.
// Writes the selected sector ids into control, and shows its validation errors.
@Component({
  selector: 'app-sector-select',
  imports: [],
  templateUrl: './sector-select.html',
  styleUrl: './sector-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectorSelect {
  control = input.required<FormControl<string[]>>();
  sectors = input.required<SectorDto[]>();
}
