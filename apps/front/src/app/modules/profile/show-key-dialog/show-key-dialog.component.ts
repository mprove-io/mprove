import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

export interface ShowKeyDialogData {
  apiKey: string;
}

@Component({
  selector: 'm-show-key-dialog',
  templateUrl: './show-key-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class ShowKeyDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  apiKey: string;
  maskedApiKey: string;
  copied = false;
  showValue = false;

  constructor(
    public ref: DialogRef<ShowKeyDialogData>,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.apiKey = this.ref.data.apiKey;

    let parts = this.apiKey.split('-');
    let prefix = parts.slice(0, 2).join('-');
    let hiddenPart = parts.slice(2).join('-');
    this.maskedApiKey = prefix + '-' + '•'.repeat(32);

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.apiKey).then(() => {
      this.copied = true;
      this.cd.detectChanges();
    });
  }

  toggleShowValue() {
    this.showValue = !this.showValue;
  }

  close() {
    this.ref.close();
  }
}
