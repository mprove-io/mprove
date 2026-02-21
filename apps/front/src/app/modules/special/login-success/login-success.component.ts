import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { LOGIN_SUCCESS_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_BRANCH,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PROD_REPO_ID
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { NavQuery } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { AuthService } from '#front/app/services/auth.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-login-success',
  templateUrl: './login-success.component.html'
})
export class LoginSuccessComponent implements OnInit {
  pageTitle = LOGIN_SUCCESS_PAGE_TITLE;

  spinnerName = 'loginSuccessSpinner';

  constructor(
    private title: Title,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private authService: AuthService,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let userId: string;
    this.userQuery
      .select()
      .pipe(
        tap(x => {
          userId = x.userId;
        }),
        take(1)
      )
      .subscribe();

    let orgId: string;
    let projectId: string;
    let isRepoProd;
    let branchId;
    let envId;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          orgId = x.orgId;
          projectId = x.projectId;
          isRepoProd = x.isRepoProd;
          branchId = x.branchId;
          envId = x.envId;

          if (
            isUndefined(orgId) ||
            isUndefined(projectId) ||
            isUndefined(isRepoProd) ||
            isUndefined(branchId)
          ) {
            this.navigateService.navigateToProfile();
          } else {
            let repoId = isRepoProd === true ? PROD_REPO_ID : userId;

            let projectReportLinks = this.uiQuery.getValue().projectReportLinks;
            let pLink = projectReportLinks.find(
              link => link.projectId === projectId
            );

            let navParts: string[];

            if (isDefined(pLink)) {
              navParts = [
                PATH_ORG,
                orgId,
                PATH_PROJECT,
                projectId,
                PATH_REPO,
                repoId,
                PATH_BRANCH,
                branchId,
                PATH_ENV,
                envId,
                PATH_REPORTS,
                PATH_REPORT,
                pLink.reportId
              ];
            } else {
              navParts = [
                PATH_ORG,
                orgId,
                PATH_PROJECT,
                projectId,
                PATH_REPO,
                repoId,
                PATH_BRANCH,
                branchId,
                PATH_ENV,
                envId,
                PATH_REPORTS,
                PATH_REPORTS_LIST
              ];
            }

            this.navigateService.navigateTo({ navParts: navParts });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
