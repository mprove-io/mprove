import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { EvsQuery } from '~front/app/queries/evs.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { EvsStore } from '~front/app/stores/evs.store';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-project-evs',
  templateUrl: './project-evs.component.html'
})
export class ProjectEvsComponent implements OnInit {
  pageTitle = constants.PROJECT_EVS_PAGE_TITLE;

  environmentId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  evs: common.Ev[] = [];
  evs$ = this.evsQuery.evs$.pipe(
    tap(x => {
      this.evs = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public evsStore: EvsStore,
    public memberQuery: MemberQuery,
    public navQuery: NavQuery,
    public evsQuery: EvsQuery,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.environmentId = this.route.snapshot.params[
      common.PARAMETER_ENVIRONMENT_ID
    ];
  }

  getEvs() {
    let payload: apiToBackend.ToBackendGetEvsRequestPayload = {
      projectId: this.nav.projectId,
      envId: this.environmentId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEvs, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendGetEvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.evsStore.update(resp.payload);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  navToEnvironments() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_ENVIRONMENTS
    ]);
  }

  addVariable() {
    this.myDialogService.showAddEv({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      envId: this.environmentId
    });
  }

  deleteVariable(ev: common.Ev) {
    // this.myDialogService.showDeleteConnection({
    //   apiService: this.apiService,
    //   projectId: connection.projectId,
    //   envId: connection.envId,
    //   connectionId: connection.connectionId
    // });
  }

  editVariable(ev: common.Ev, i: number) {
    // this.myDialogService.showEditConnection({
    //   apiService: this.apiService,
    //   connection: connection,
    //   i: i
    // });
  }
}
