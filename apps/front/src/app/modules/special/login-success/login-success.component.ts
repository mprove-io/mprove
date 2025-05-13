import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-login-success',
  templateUrl: './login-success.component.html'
})
// , OnDestroy
export class LoginSuccessComponent implements OnInit {
  pageTitle = constants.LOGIN_SUCCESS_PAGE_TITLE;

  spinnerName = 'loginSuccessSpinner';

  constructor(
    private title: Title,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private authService: AuthService,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    // this.spinner.show(this.spinnerName);

    // console.log('startWatch from LoginSuccessComponent');
    this.authService.startWatch();

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

    let orgId;
    let projectId;
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
            common.isUndefined(orgId) ||
            common.isUndefined(projectId) ||
            common.isUndefined(isRepoProd) ||
            common.isUndefined(branchId)
          ) {
            this.navigateService.navigateToProfile();
          } else {
            let repoId = isRepoProd === true ? common.PROD_REPO_ID : userId;

            let navParts = [
              common.PATH_ORG,
              orgId,
              common.PATH_PROJECT,
              projectId,
              common.PATH_REPO,
              repoId,
              common.PATH_BRANCH,
              branchId,
              common.PATH_ENV,
              envId,
              common.PATH_REPORTS,
              common.PATH_REPORT,
              common.LAST_SELECTED_REPORT_ID
            ];

            this.navigateService.navigateTo({ navParts: navParts });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  // ngOnDestroy() {
  //   this.spinner.hide(this.spinnerName);
  // }
}
