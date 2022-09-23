import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { EnvironmentsStore } from '~front/app/stores/environments.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-environments',
  templateUrl: './project-environments.component.html'
})
export class ProjectEnvironmentsComponent implements OnInit {
  pageTitle = constants.PROJECT_ENVIRONMENTS_PAGE_TITLE;

  currentPage: any = 1;
  perPage = constants.ENVIRONMENTS_PER_PAGE;

  projectId: string;
  projectId$ = this.navQuery.projectId$.pipe(
    tap(x => {
      this.projectId = x;
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
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private environmentsQuery: EnvironmentsQuery,
    private environmentsStore: EnvironmentsStore,
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    public navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  getEnvironments(pageNum: number) {
    let payload: apiToBackend.ToBackendGetEnvsRequestPayload = {
      projectId: this.projectId,
      pageNum: pageNum,
      perPage: this.perPage
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendGetEnvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.environmentsStore.update(resp.payload);
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
      projectId: this.projectId
    });
  }

  deleteEnvironment(environment: common.Env) {
    // this.myDialogService.showDeleteConnection({
    //   apiService: this.apiService,
    //   projectId: connection.projectId,
    //   connectionId: connection.connectionId
    // });
  }
}
