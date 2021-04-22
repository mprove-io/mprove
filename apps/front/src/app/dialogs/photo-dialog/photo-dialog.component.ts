import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-photo-dialog',
  templateUrl: './photo-dialog.component.html'
})
export class PhotoDialogComponent {
  constructor(public ref: DialogRef) {}
}
