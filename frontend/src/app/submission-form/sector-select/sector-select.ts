import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { SectorDto } from '../../api/api.models';
import { countSelectedDescendants, flattenSectors } from '../../sectors/sector-tree';

@Component({
  selector: 'app-sector-select',
  imports: [NgTemplateOutlet],
  templateUrl: './sector-select.html',
  styleUrl: './sector-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeIfOutside($event)',
  },
})
export class SectorSelect implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dropdown = viewChild.required<ElementRef<HTMLDetailsElement>>('dropdown');
  private readonly dropdownSummary = viewChild.required<ElementRef<HTMLElement>>('dropdownSummary');

  control = input.required<FormControl<string[]>>();
  sectors = input.required<SectorDto[]>();

  protected readonly selectedIds = signal<string[]>([]);
  protected readonly showError = signal(false);
  protected readonly allSectors = computed(() => flattenSectors(this.sectors()));
  protected readonly selectedSectors = computed(() =>
    this.allSectors().filter((sector) => this.selectedIds().includes(sector.id)),
  );

  ngOnInit(): void {
    this.syncFromControl();
    this.control()
      .events.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncFromControl());
  }

  protected isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  protected toggle(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const ids = this.control().value;
    this.control().setValue(checked ? [...ids, id] : ids.filter((selectedId) => selectedId !== id));
    this.control().markAsTouched();
  }

  protected remove(id: string): void {
    this.control().setValue(this.control().value.filter((selectedId) => selectedId !== id));
    this.control().markAsTouched();
  }

  protected countSelected(sector: SectorDto): number {
    return countSelectedDescendants(sector, this.selectedIds());
  }

  protected closeIfOutside(event: MouseEvent): void {
    const dropdown = this.dropdown().nativeElement;
    if (!dropdown.contains(event.target as Node)) {
      dropdown.open = false;
    }
  }

  protected closeOnEscape(): void {
    this.dropdown().nativeElement.open = false;
    this.dropdownSummary().nativeElement.focus();
  }

  private syncFromControl(): void {
    const control = this.control();
    this.selectedIds.set(control.value);
    this.showError.set(control.touched && control.hasError('required'));
  }
}
