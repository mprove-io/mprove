import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  selector: 'm-new-viz-dialog',
  templateUrl: './new-viz-dialog.component.html'
})
export class NewVizDialogComponent {
  constructor(
    public ref: DialogRef,
    private navigateService: NavigateService
  ) {}

  navToModel(modelId: string) {
    this.ref.close();

    this.navigateService.navigateToModel(modelId);
  }
}
