import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

export interface PhotoDialogData {
  avatarBig: string;
  initials: string;
}

@Component({
  selector: 'm-photo-dialog',
  templateUrl: './photo-dialog.component.html'
})
export class PhotoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;

  constructor(public ref: DialogRef<PhotoDialogData>) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }
}
