import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-access-denied',
  templateUrl: 'access-denied.component.html',
  styleUrls: ['access-denied.component.scss'],
})
export class AccessDeniedDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AccessDeniedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
