import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PROJECT_DELETED_PAGE_TITLE } from '#common/constants/page-titles';
import { LOCAL_STORAGE_DELETED_PROJECT_NAME } from '#common/constants/top-front';
import { isUndefined } from '#common/functions/is-undefined';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-project-deleted',
  templateUrl: './project-deleted.component.html'
})
export class ProjectDeletedComponent implements OnInit {
  pageTitle = PROJECT_DELETED_PAGE_TITLE;

  projectName: string;

  constructor(
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.projectName = localStorage.getItem(LOCAL_STORAGE_DELETED_PROJECT_NAME);
    localStorage.removeItem(LOCAL_STORAGE_DELETED_PROJECT_NAME);

    if (isUndefined(this.projectName)) {
      this.authService.logout();
    }
  }
}
