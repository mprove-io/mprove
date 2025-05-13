import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-org-owner-changed',
  templateUrl: './org-owner-changed.component.html'
})
export class OrgOwnerChangedComponent implements OnInit {
  pageTitle = constants.ORGANIZATION_OWNER_CHANGED_PAGE_TITLE;

  orgName: string;
  newOrgOwner: string;

  constructor(
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.orgName = localStorage.getItem(
      constants.LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME);

    this.newOrgOwner = localStorage.getItem(
      constants.LOCAL_STORAGE_NEW_ORG_OWNER
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_NEW_ORG_OWNER);

    if (
      common.isUndefined(this.orgName) ||
      common.isUndefined(this.newOrgOwner)
    ) {
      this.authService.logout();
    }
  }
}
