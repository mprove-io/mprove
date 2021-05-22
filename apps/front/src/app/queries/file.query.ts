import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { FileState, FileStore } from '../stores/file.store';

@Injectable({ providedIn: 'root' })
export class FileQuery extends Query<FileState> {
  constructor(protected store: FileStore) {
    super(store);
  }
}
