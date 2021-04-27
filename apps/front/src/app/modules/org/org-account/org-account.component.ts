import { Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { OrgState } from '~front/app/stores/org.store';

@Component({
  selector: 'm-org-account',
  templateUrl: './org-account.component.html'
})
export class OrgAccountComponent {
  constructor(
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    // private authService: AuthService,
    private apiService: ApiService,
    // private router: Router,
    private myDialogService: MyDialogService
  ) {}

  deleteOrg() {
    let org: OrgState;
    this.orgQuery
      .select()
      .pipe(
        tap(x => {
          org = x;
        }),
        take(1)
      )
      .subscribe();

    this.myDialogService.showDeleteOrg({
      apiService: this.apiService,
      orgId: org.orgId,
      orgName: org.name
    });
  }
}
