import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { PersonDto, PersonInput } from '../api/api.models';
import { PersonApi } from '../api/person-api';

@Injectable({
  providedIn: 'root',
})
export class PersonSession {
  private readonly personApi = inject(PersonApi);
  private readonly storageKey = 'personId';

  load(): Observable<PersonDto | null> {
    const id = sessionStorage.getItem(this.storageKey);
    if (id === null) {
      return of(null);
    }
    return this.personApi.get(id);
  }

  save(input: PersonInput): Observable<PersonDto> {
    const id = sessionStorage.getItem(this.storageKey);
    if (id === null) {
      return this.personApi
        .create(input)
        .pipe(tap((person) => sessionStorage.setItem(this.storageKey, person.id)));
    }
    return this.personApi.update({ id, ...input });
  }
}
