import { Component, Input } from '@angular/core';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { RepsQuery } from '~front/app/queries/reps.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-rep-options',
  templateUrl: './rep-options.component.html'
})
export class RepOptionsComponent {
  @Input()
  rep: common.RepX;

  repDeletedFnBindThis = this.repDeletedFn.bind(this);

  constructor(
    private navigateService: NavigateService,
    private apiService: ApiService,
    private repQuery: RepQuery,
    private repsQuery: RepsQuery,
    private navQuery: NavQuery,
    private myDialogService: MyDialogService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.rep.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: 0
    });
  }

  deleteRep(event: MouseEvent) {
    event.stopPropagation();

    let nav = this.navQuery.getValue();
    let selectedRep = this.repQuery.getValue();

    this.myDialogService.showDeleteRep({
      rep: this.rep,
      apiService: this.apiService,
      repDeletedFnBindThis: this.repDeletedFnBindThis,
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      isStartSpinnerUntilNavEnd: selectedRep.repId === this.rep.repId
    });
  }

  repDeletedFn(deletedRepId: string) {
    let selectedRep = this.repQuery.getValue();
    let reps = this.repsQuery.getValue().reps;

    let repIndex = reps.findIndex(x => x.repId === deletedRepId);

    let newReps = [...reps.slice(0, repIndex), ...reps.slice(repIndex + 1)];

    this.repsQuery.update({ reps: newReps });

    if (selectedRep.repId === deletedRepId) {
      this.navigateService.navigateToMetricsRep({
        repId: common.EMPTY_REP_ID,
        draft: false,
        selectNodes: []
      });
    }
  }
}
