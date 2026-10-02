import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { Role } from '#common/types/backend/parts/role';
import { BaseQuery } from './base.query';

export class RolesState {
  roles: Role[];
}

let rolesState: RolesState = {
  roles: []
};

@Injectable({ providedIn: 'root' })
export class RolesQuery extends BaseQuery<RolesState> {
  roles$ = this.store.pipe(select(state => state.roles));

  constructor() {
    super(createStore({ name: 'roles' }, withProps<RolesState>(rolesState)));
  }
}
