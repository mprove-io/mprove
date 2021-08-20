import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-org-deleted',
  templateUrl: './org-deleted.component.html'
})
export class OrgDeletedComponent implements OnInit {
  pageTitle = constants.ORGANIZATION_DELETED_PAGE_TITLE;

  orgName: string;

  constructor(private authService: AuthService, private title: Title) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.orgName = localStorage.getItem(
      constants.LOCAL_STORAGE_DELETED_ORG_NAME
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_DELETED_ORG_NAME);

    if (common.isUndefined(this.orgName)) {
      this.authService.logout();
    }
  }
}
