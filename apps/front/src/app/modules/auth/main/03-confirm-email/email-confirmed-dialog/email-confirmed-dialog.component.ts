import { Component, HostListener, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-email-confirmed-dialog',
  templateUrl: './email-confirmed-dialog.component.html'
})
export class EmailConfirmedDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(public ref: DialogRef) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  onOk() {
    this.ref.close();
  }
}
