import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

const main = MAIN;

@Component({
  moduleId: module.id,
  selector: 'm-er-dialog',
  templateUrl: 'er-dialog.component.html',
  styleUrls: ['er-dialog.component.scss'],
})

export class ErDialogComponent implements OnInit {

  eventId: string;
  name: string;
  message: string;

  main = main;

  constructor(
    public dialogRef: MatDialogRef<ErDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    let error = this.data.error;

    if (error.data) {

      this.eventId = error.data.event_id;
      this.name = error.data.name;
      this.message = error.data.message;
    }
  }

  reloadClick(): void {
    window.location.reload();
  }

  forumClick(): void {
    window.open('https://forum.mprove.io', '_blank');
    // this.dialogRef.close();
  }

  okClick(): void {
    this.dialogRef.close();
  }
}
