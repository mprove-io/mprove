import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-org-deleted',
  templateUrl: './org-deleted.component.html'
})
export class OrgDeletedComponent implements OnInit {
  pageTitle = ORGANIZATION_DELETED_PAGE_TITLE;

  orgName: string;

  constructor(
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.orgName = localStorage.getItem(LOCAL_STORAGE_DELETED_ORG_NAME);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_ORG_NAME);

    if (isUndefined(this.orgName)) {
      this.authService.logout();
    }
  }
}
