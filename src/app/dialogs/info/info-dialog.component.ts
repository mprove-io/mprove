import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-info-dialog',
  templateUrl: 'info-dialog.component.html',
  styleUrls: ['info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {
  info: string;
  constructor(
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.info = this.data.info;
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
