import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { BaseQuery } from './base.query';

export class FileState {
  originalContent: string;
  content: string;
  name: string;
  fileId: string;
  fileNodeId: string;
  isExist: boolean;
}

let fileState: FileState = {
  originalContent: undefined,
  content: undefined,
  name: undefined,
  fileId: undefined,
  fileNodeId: undefined,
  isExist: false
};

@Injectable({ providedIn: 'root' })
export class FileQuery extends BaseQuery<FileState> {
  fileId$ = this.store.pipe(select(state => state.fileId));
  fileNodeId$ = this.store.pipe(select(state => state.fileNodeId));

  constructor() {
    super(createStore({ name: 'file' }, withProps<FileState>(fileState)));
  }
}
