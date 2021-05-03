import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { getFullName } from '~front/app/functions/get-full-name';
import { NavQuery } from '~front/app/queries/nav.query';
import { TeamQuery } from '~front/app/queries/team.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent {
  members: common.Member[] = [];
  members$ = this.teamQuery.members$.pipe(
    tap(x => {
      this.members = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public teamQuery: TeamQuery,
    public navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

  getFullName(x: any) {
    // console.log(x[0]);
    return getFullName(x[0]);
  }
}
