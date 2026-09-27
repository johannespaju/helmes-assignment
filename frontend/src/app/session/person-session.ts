import { Injectable } from '@angular/core';

// TODO: Keeps the saved person's id in sessionStorage and uses PersonApi.
// load(): the stored person, or nothing. save(person): POST the first time, PUT afterwards.
@Injectable({
  providedIn: 'root',
})
export class PersonSession {}
