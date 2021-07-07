import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { FileState, FileStore } from '../stores/file.store';

@Injectable({ providedIn: 'root' })
export class FileQuery extends Query<FileState> {
  fileId$ = this.select(state => state.fileId);

  constructor(protected store: FileStore) {
    super(store);
  }
}
