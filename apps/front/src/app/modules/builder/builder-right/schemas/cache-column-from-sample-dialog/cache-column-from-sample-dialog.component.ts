import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { SharedModule } from '../../../../shared/shared.module';

export interface CacheColumnFromSampleDialogData {
  sampleSize: number;
  onSubmit: (sampleSize: number) => void;
}

@Component({
  selector: 'm-cache-column-from-sample-dialog',
  templateUrl: './cache-column-from-sample-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, SharedModule]
})
export class CacheColumnFromSampleDialogComponent {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;
  sampleSize = this.dataItem.sampleSize;

  constructor(public ref: DialogRef<CacheColumnFromSampleDialogData>) {}

  submit() {
    let isSampleSizeInteger = Number.isInteger(this.sampleSize);

    if (!isSampleSizeInteger || this.sampleSize < 1) {
      return;
    }

    this.dataItem.onSubmit(this.sampleSize);
    this.ref.close();
  }
}
