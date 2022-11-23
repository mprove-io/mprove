import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class FileState {
  originalContent: string;
  content: string;
  name: string;
  fileId: string;
  fileNodeId: string;
  isExist: boolean;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'file',
  resettable: true
})
export class FileStore extends Store<FileState> {
  constructor() {
    super(<FileState>{
      originalContent: undefined,
      content: undefined,
      name: undefined,
      fileId: undefined,
      fileNodeId: undefined,
      isExist: false
    });
  }
}
