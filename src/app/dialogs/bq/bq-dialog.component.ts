import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-bq-dialog',
  templateUrl: 'bq-dialog.component.html',
  styleUrls: ['bq-dialog.component.scss'],
})
export class BqDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<BqDialogComponent>,
  ) {
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
