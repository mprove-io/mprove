import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { AuthService } from '~front/app/services/auth.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { UserQuery } from '../../queries/user.query';
import { ApiService } from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class NavBarResolver implements Resolve<Observable<boolean>> {
  tokenUserId: string;

  userUserId: string;
  userIsEmailVerified = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private navQuery: NavQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    if (!this.authService.authenticated()) {
      this.authService.logout();
      return of(false);
    }

    let isRepoInPath =
      routerStateSnapshot.url
        .split('/')
        .findIndex(el => el === common.PATH_REPO) === 5;

    // console.log('stopWatch from NavBarResolver');
    this.authService.stopWatch();

    this.userQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.userUserId = x.userId;
        this.userIsEmailVerified = x.isEmailVerified;
      });

    this.tokenUserId = this.authService.getTokenUserId();

    if (
      this.tokenUserId === undefined
      // ||
      // (common.isDefined(this.userUserId) &&
      //   this.userUserId !== this.tokenUserId)
    ) {
      this.authService.logout();
      return of(false);
    }

    if (
      common.isDefined(this.userUserId) &&
      this.userIsEmailVerified !== true
    ) {
      this.router.navigate([common.PATH_VERIFY_EMAIL]);
      return of(false);
    }

    let payload: apiToBackend.ToBackendGetNavRequestPayload = {
      orgId: localStorage.getItem(constants.LOCAL_STORAGE_ORG_ID),
      projectId: localStorage.getItem(constants.LOCAL_STORAGE_PROJECT_ID),
      getRepo: isRepoInPath === false
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetNavResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let {
              avatarSmall,
              avatarBig,
              orgId,
              orgOwnerId,
              orgName,
              projectId,
              projectName,
              projectDefaultBranch,
              isRepoProd,
              branchId,
              envId,
              needValidate,
              user,
              serverNowTs,
              userMember,
              struct,
              repo
            } = resp.payload;

            let nav: NavState = {
              avatarSmall,
              avatarBig,
              orgId,
              orgOwnerId,
              orgName,
              projectId,
              projectName,
              projectDefaultBranch,
              isRepoProd,
              branchId,
              envId,
              needValidate,
              serverTimeDiff: Date.now() - serverNowTs
            };

            this.navQuery.update(nav);
            this.userQuery.update(user);
            this.uiQuery.updatePart({ ...resp.payload.user.ui });

            if (common.isDefined(userMember)) {
              this.memberQuery.update(resp.payload.userMember);
            }
            if (common.isDefined(struct)) {
              this.structQuery.update(resp.payload.struct);
            }
            if (common.isDefined(repo)) {
              this.repoQuery.update(resp.payload.repo);
            }

            if (user.isEmailVerified === true) {
              // console.log('startWatch from NavBarResolver');
              this.authService.startWatch();
              return true;
            } else {
              this.router.navigate([common.PATH_VERIFY_EMAIL]);
              return false;
            }
          } else {
            return false;
          }
        })
      );
  }
}
