import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class BranchResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
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
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let isExist = resp.payload.isExist;

            if (isExist !== true) {
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
          } else {
            return false;
          }
        })
      );
  }
}
