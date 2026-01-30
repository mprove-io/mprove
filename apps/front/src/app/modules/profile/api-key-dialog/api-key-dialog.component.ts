import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'm-api-key-dialog',
  templateUrl: './api-key-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class ApiKeyDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  apiKey = localStorage.token;

  constructor(public ref: DialogRef) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  cancel() {
    this.ref.close();
  }
}
