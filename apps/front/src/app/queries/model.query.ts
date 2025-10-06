import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { Model } from '~common/interfaces/blockml/model';
import { BaseQuery } from './base.query';

export class ModelState extends Model {}

let modelState: ModelState = {
  structId: undefined,
  modelId: undefined,
  type: undefined,
  source: undefined,
  connectionId: undefined,
  connectionType: undefined,
  filePath: undefined,
  fileText: undefined,
  storeContent: undefined,
  malloyModelDef: undefined,
  // isStoreModel: undefined,
  dateRangeIncludesRightSide: undefined,
  accessRoles: [],
  label: undefined,
  fields: [],
  nodes: [],
  serverTs: undefined
};

@Injectable({ providedIn: 'root' })
export class ModelQuery extends BaseQuery<ModelState> {
  fields$ = this.store.pipe(select(state => state.fields));

  constructor() {
    super(createStore({ name: 'model' }, withProps<ModelState>(modelState)));
  }
}
