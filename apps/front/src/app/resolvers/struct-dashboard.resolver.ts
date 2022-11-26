import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';
import { DashboardStore } from '../stores/dashboard.store';
import { MemberStore } from '../stores/member.store';
import { NavState, NavStore } from '../stores/nav.store';
import { StructStore } from '../stores/struct.store';

@Injectable({ providedIn: 'root' })
export class StructDashboardResolver implements Resolve<Promise<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private dashboardStore: DashboardStore,
    private structStore: StructStore,
    private memberStore: MemberStore,
    private myDialogService: MyDialogService,
    private navStore: NavStore,
    private router: Router
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let parametersDashboardId = route.params[common.PARAMETER_DASHBOARD_ID];

    let payload: apiToBackend.ToBackendGetDashboardRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      dashboardId: parametersDashboardId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            if (resp.payload.isBranchExist === true) {
              this.memberStore.update(resp.payload.userMember);

              this.structStore.update(resp.payload.struct);
              this.navStore.update(state =>
                Object.assign({}, state, <NavState>{
                  branchId: nav.branchId,
                  envId: nav.envId,
                  needValidate: resp.payload.needValidate
                })
              );
              this.dashboardStore.update(resp.payload.dashboard);

              return true;
            } else {
              this.myDialogService.showError({
                errorData: {
                  message: enums.ErEnum.BRANCH_DOES_NOT_EXIST
                },
                isThrow: false
              });

              this.router.navigate([
                common.PATH_ORG,
                nav.orgId,
                common.PATH_PROJECT,
                nav.projectId,
                common.PATH_SETTINGS
              ]);

              return false;
            }
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
