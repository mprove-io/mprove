import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-dep-calc-removed-dialog',
  templateUrl: 'dep-calc-removed-dialog.component.html',
  styleUrls: ['dep-calc-removed-dialog.component.scss'],
})
export class DepCalcRemovedDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DepCalcRemovedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
