import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ORGANIZATION_OWNER_CHANGED_PAGE_TITLE } from '#common/constants/page-titles';
import {
  LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME,
  LOCAL_STORAGE_NEW_ORG_OWNER
} from '#common/constants/top-front';
import { isUndefined } from '#common/functions/is-undefined';
import { AuthService } from '#front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-org-owner-changed',
  templateUrl: './org-owner-changed.component.html'
})
export class OrgOwnerChangedComponent implements OnInit {
  pageTitle = ORGANIZATION_OWNER_CHANGED_PAGE_TITLE;

  orgName: string;
  newOrgOwner: string;

  constructor(
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.orgName = localStorage.getItem(LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME);
    localStorage.removeItem(LOCAL_STORAGE_CHANGED_OWNER_ORG_NAME);

    this.newOrgOwner = localStorage.getItem(LOCAL_STORAGE_NEW_ORG_OWNER);
    localStorage.removeItem(LOCAL_STORAGE_NEW_ORG_OWNER);

    if (isUndefined(this.orgName) || isUndefined(this.newOrgOwner)) {
      this.authService.logout();
    }
  }
}
