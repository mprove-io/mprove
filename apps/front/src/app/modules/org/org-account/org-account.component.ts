import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-org-account',
  templateUrl: './org-account.component.html'
})
export class OrgAccountComponent implements OnInit {
  pageTitle = ORGANIZATION_ACCOUNT_PAGE_TITLE;

  org: Org;
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
    private orgQuery: OrgQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

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
}
