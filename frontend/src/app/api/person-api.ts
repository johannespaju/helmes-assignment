import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { PersonDto, PersonInput } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class PersonApi {
  private readonly http = inject(HttpClient);

  get(id: string): Observable<PersonDto> {
    return this.http.get<PersonDto>(`${API_BASE_URL}/persons/${id}`);
  }

  create(input: PersonInput): Observable<PersonDto> {
    return this.http.post<PersonDto>(`${API_BASE_URL}/persons`, input);
  }

  update(person: PersonDto): Observable<PersonDto> {
    return this.http.put<PersonDto>(`${API_BASE_URL}/persons/${person.id}`, person);
  }
}
