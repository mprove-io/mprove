import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as configs from 'src/app/configs/_index';

@Component({
  moduleId: module.id,
  selector: 'm-member-picture-dialog',
  templateUrl: 'member-picture-dialog.component.html'
})
export class MemberPictureDialogComponent {

  dynamicAssetsBaseUrl: string = configs.pathConfig.dynamicAssetsBaseUrl;

  constructor(
    public dialogRef: MatDialogRef<MemberPictureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { row: any },
  ) { }

  onSubmit() {
  }
}
