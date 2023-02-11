import { Component, Input } from '@angular/core';
import { RepQuery } from '~front/app/queries/rep.query';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-row-options',
  templateUrl: './row-options.component.html'
})
export class RowOptionsComponent {
  @Input()
  data: any;

  constructor(private repService: RepService, private repQuery: RepQuery) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
    console.log(this.data);
  }

  deleteRow(event: MouseEvent) {
    event.stopPropagation();

    let selectedRep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.data.idx
    };

    if (selectedRep.draft === true) {
      this.repService.editDraftRep({
        repId: selectedRep.repId,
        rowChanges: [rowChange],
        changeType: common.ChangeTypeEnum.Delete
      });
    } else {
      this.repService.navCreateDraftRep({
        fromRepId: selectedRep.repId,
        fromDraft: selectedRep.draft,
        rowChanges: [rowChange],
        changeType: common.ChangeTypeEnum.Delete
      });
    }
  }
}
