import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { StructState, StructStore } from '../stores/struct.store';

@Injectable({ providedIn: 'root' })
export class StructQuery extends Query<StructState> {
  constructor(protected store: StructStore) {
    super(store);
  }
}
