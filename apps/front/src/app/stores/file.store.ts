import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export class FileState {
  content: string;
  name: string;
  fileId: string;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'file',
  resettable: true
})
export class FileStore extends Store<FileState> {
  constructor() {
    super(<FileState>{
      content: undefined,
      name: undefined,
      fileId: undefined
    });
  }
}
