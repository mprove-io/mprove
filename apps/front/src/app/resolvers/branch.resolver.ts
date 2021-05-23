import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';
import { NavState, NavStore } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class BranchResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navStore: NavStore,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let branchId = route.params[common.PARAMETER_BRANCH_ID];

    let payload: apiToBackend.ToBackendIsBranchExistRequestPayload = {
      projectId: nav.projectId,
      branchId: branchId,
      isRepoProd: nav.isRepoProd
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsBranchExist,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendIsBranchExistResponse) => {
          let isExist = resp.payload.isExist;

          // console.log('branch-resolver:', branchId);

          if (isExist === true) {
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                branchId: branchId
              })
            );
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
          }

          return isExist;
        })
      );
  }
}
