import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';
import { MemberStore } from '../stores/member.store';
import { NavState, NavStore } from '../stores/nav.store';
import { RepoStore } from '../stores/repo.store';
import { StructStore } from '../stores/struct.store';

@Injectable({ providedIn: 'root' })
export class StructRepoFilesResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberStore: MemberStore,
    private myDialogService: MyDialogService,
    private repoStore: RepoStore,
    private structStore: StructStore,
    private navStore: NavStore,
    private router: Router
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let branchId = route.params[common.PARAMETER_BRANCH_ID];
    let envId = route.params[common.PARAMETER_ENV_ID];

    let payload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: branchId,
      envId: envId,
      isFetch: true
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            if (resp.payload.isBranchExist === true) {
              this.memberStore.update(resp.payload.userMember);

              this.structStore.update(resp.payload.struct);
              this.navStore.update(state =>
                Object.assign({}, state, <NavState>{
                  branchId: branchId,
                  envId: envId,
                  needValidate: resp.payload.needValidate
                })
              );
              this.repoStore.update(resp.payload.repo);

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
