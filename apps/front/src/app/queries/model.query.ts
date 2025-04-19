import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { BaseQuery } from './base.query';

export class ModelState extends common.Model {}

let modelState: ModelState = {
  structId: undefined,
  modelId: undefined,
  connectionId: undefined,
  filePath: undefined,
  content: undefined,
  isViewModel: undefined,
  isStoreModel: undefined,
  dateRangeIncludesRightSide: undefined,
  accessRoles: [],
  label: undefined,
  gr: undefined,
  hidden: false,
  fields: [],
  nodes: [],
  description: undefined,
  serverTs: undefined
};

@Injectable({ providedIn: 'root' })
export class ModelQuery extends BaseQuery<ModelState> {
  fields$ = this.store.pipe(select(state => state.fields));

  constructor() {
    super(createStore({ name: 'model' }, withProps<ModelState>(modelState)));
  }
}
