import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { SharedModule } from '../shared.module';

export interface PhotoDialogData {
  avatar: string;
  initials: string;
}

@Component({
  selector: 'm-photo-dialog',
  templateUrl: './photo-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule]
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
