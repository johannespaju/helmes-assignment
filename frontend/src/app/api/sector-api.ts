import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { SectorDto } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class SectorApi {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SectorDto[]> {
    return this.http.get<SectorDto[]>(`${API_BASE_URL}/sectors`);
  }
}
