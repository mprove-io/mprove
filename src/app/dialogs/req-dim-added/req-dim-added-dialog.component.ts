import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-req-dim-added-dialog',
  templateUrl: 'req-dim-added-dialog.component.html',
  styleUrls: ['req-dim-added-dialog.component.scss']
})
export class ReqDimAddedDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReqDimAddedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  okClick(): void {
    this.dialogRef.close();
  }
}
