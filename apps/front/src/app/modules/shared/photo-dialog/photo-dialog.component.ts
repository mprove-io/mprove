import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

export interface PhotoDialogDataItem {
  avatarBig: string;
  initials: string;
}

@Component({
  selector: 'm-photo-dialog',
  templateUrl: './photo-dialog.component.html'
})
export class PhotoDialogComponent {
  dataItem = this.ref.data;

  constructor(public ref: DialogRef<PhotoDialogDataItem>) {}
}
