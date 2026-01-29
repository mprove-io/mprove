import { Component, Input } from '@angular/core';
import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-files-right-panel-toggle',
  templateUrl: 'files-right-panel-toggle.component.html'
})
export class FilesRightPanelToggleComponent {
  @Input()
  isDisabled: boolean;

  @Input()
  needValidate: boolean;

  @Input()
  repoConflictsIsEmpty: boolean;

  @Input()
  structErrorsIsEmpty: boolean;

  @Input()
  fileNodeId: string;

  @Input()
  secondFileNodeId: string;

  constructor(private uiQuery: UiQuery) {}

  rightOnClick(event: any, fileNodeId: string) {
    event.stopPropagation();

    if (this.secondFileNodeId === fileNodeId) {
      this.uiQuery.updatePart({ secondFileNodeId: undefined });
    } else {
      this.uiQuery.updatePart({ secondFileNodeId: fileNodeId });
    }
  }
}
