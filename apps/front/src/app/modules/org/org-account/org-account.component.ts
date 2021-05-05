import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-org-account',
  templateUrl: './org-account.component.html'
})
export class OrgAccountComponent {
  org: common.Org;
  org$ = this.orgQuery.select().pipe(
    tap(x => {
      this.org = x;
      this.cd.detectChanges();
    })
  );

  isOrgOwner: boolean;
  isOrgOwner$ = this.orgQuery.isOrgOwner$.pipe(
    tap(x => {
      this.isOrgOwner = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef
  ) {}

  deleteOrg() {
    this.myDialogService.showDeleteOrg({
      apiService: this.apiService,
      orgId: this.org.orgId,
      orgName: this.org.name
    });
  }

  editName() {
    this.myDialogService.showEditOrgName({
      apiService: this.apiService,
      orgId: this.org.orgId,
      orgName: this.org.name
    });
  }

  editOwner() {
    this.myDialogService.showEditOrgOwner({
      apiService: this.apiService,
      orgId: this.org.orgId,
      ownerEmail: this.org.ownerEmail
    });
  }

  editContactPhone() {
    this.myDialogService.showEditPhoneNumber({
      apiService: this.apiService,
      orgId: this.org.orgId,
      contactPhone: this.org.contactPhone
    });
  }

  editCompanySize() {
    this.myDialogService.showEditCompanySize({
      apiService: this.apiService,
      orgId: this.org.orgId,
      companySize: this.org.companySize
    });
  }
}
