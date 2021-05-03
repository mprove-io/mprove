import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { getFullName } from '~front/app/functions/get-full-name';
import { NavQuery } from '~front/app/queries/nav.query';
import { TeamQuery } from '~front/app/queries/team.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { MemberExtended } from '~front/app/stores/team.store';

@Component({
  selector: 'm-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent {
  members: MemberExtended[] = [];
  members$ = this.teamQuery.members$.pipe(
    tap(x => {
      x.forEach(m => {
        console.log(m);
        m.fullName = getFullName(m);
      });
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
}
