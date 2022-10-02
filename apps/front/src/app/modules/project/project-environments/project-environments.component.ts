import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { EnvironmentsStore } from '~front/app/stores/environments.store';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-environments',
  templateUrl: './project-environments.component.html'
})
export class ProjectEnvironmentsComponent implements OnInit {
  pageTitle = constants.PROJECT_ENVIRONMENTS_PAGE_TITLE;

  envProd = common.PROJECT_ENV_PROD;

  currentPage: any = 1;
  perPage = constants.ENVIRONMENTS_PER_PAGE;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  environments: common.Env[] = [];
  environments$ = this.environmentsQuery.environments$.pipe(
    tap(x => {
      this.environments = x;
      this.cd.detectChanges();
    })
  );

  total: number;
  total$ = this.environmentsQuery.total$.pipe(
    tap(x => {
      this.total = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private environmentsQuery: EnvironmentsQuery,
    private environmentsStore: EnvironmentsStore,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private router: Router,
    public navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  getEnvsPage(pageNum: number) {
    let payload: apiToBackend.ToBackendGetEnvsRequestPayload = {
      projectId: this.nav.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendGetEnvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.environmentsStore.update({
              environments: resp.payload.envs,
              total: resp.payload.total
            });
            this.currentPage = pageNum;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  addEnvironment() {
    this.myDialogService.showAddEnvironment({
      apiService: this.apiService,
      projectId: this.nav.projectId
    });
  }

  navToVariables(environment: common.Env) {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_ENV_VARIABLES,
      environment.envId
    ]);
  }

  deleteEnvironment(environment: common.Env) {
    this.myDialogService.showDeleteEnvironment({
      apiService: this.apiService,
      projectId: environment.projectId,
      envId: environment.envId
      // pageNum: this.currentPage,
      // getEnvsPageFn: this.getEnvsPage.bind(this)
    });
  }
}
