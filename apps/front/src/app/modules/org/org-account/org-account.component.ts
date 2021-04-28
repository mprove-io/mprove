import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  selector: 'm-org-account',
  templateUrl: './org-account.component.html'
})
export class OrgAccountComponent {
  orgId: string;
  orgId$ = this.orgQuery.orgId$.pipe(tap(x => (this.orgId = x)));

  name: string;
  name$ = this.orgQuery.name$.pipe(tap(x => (this.name = x)));

  constructor(
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService
  ) {}

  deleteOrg() {
    this.myDialogService.showDeleteOrg({
      apiService: this.apiService,
      orgId: this.orgId,
      orgName: this.name
    });
  }

  editName() {
    this.myDialogService.showEditOrgName({
      apiService: this.apiService,
      orgId: this.orgId,
      orgName: this.name
    });
  }
}
