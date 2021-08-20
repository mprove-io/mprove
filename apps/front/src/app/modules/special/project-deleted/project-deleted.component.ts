import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-deleted',
  templateUrl: './project-deleted.component.html'
})
export class ProjectDeletedComponent implements OnInit {
  pageTitle = constants.PROJECT_DELETED_PAGE_TITLE;

  projectName: string;

  constructor(private authService: AuthService, private title: Title) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.projectName = localStorage.getItem(
      constants.LOCAL_STORAGE_DELETED_PROJECT_NAME
    );
    localStorage.removeItem(constants.LOCAL_STORAGE_DELETED_PROJECT_NAME);

    if (common.isUndefined(this.projectName)) {
      this.authService.logout();
    }
  }
}
