import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PATH_REPO, PATH_VERIFY_EMAIL } from '~common/constants/top';
import {
  LOCAL_STORAGE_ORG_ID,
  LOCAL_STORAGE_PROJECT_ID
} from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetNavRequestPayload,
  ToBackendGetNavResponse
} from '~common/interfaces/to-backend/nav/to-backend-get-nav';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { AuthService } from '~front/app/services/auth.service';
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
      routerStateSnapshot.url.split('/').findIndex(el => el === PATH_REPO) ===
      5;

    // console.log('stopWatch from NavBarResolver');
    // this.authService.stopWatch();

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
      // (isDefined(this.userUserId) &&
      //   this.userUserId !== this.tokenUserId)
    ) {
      this.authService.logout();
      return of(false);
    }

    if (isDefined(this.userUserId) && this.userIsEmailVerified !== true) {
      this.router.navigate([PATH_VERIFY_EMAIL]);
      return of(false);
    }

    let payload: ToBackendGetNavRequestPayload = {
      orgId: localStorage.getItem(LOCAL_STORAGE_ORG_ID),
      projectId: localStorage.getItem(LOCAL_STORAGE_PROJECT_ID),
      getRepo: isRepoInPath === false
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetNav,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetNavResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
              mproveVersion: resp.info.mproveVersion,
              serverTimeDiff: Date.now() - serverNowTs
            };

            this.navQuery.update(nav);
            this.userQuery.update(user);
            this.uiQuery.updatePart({ ...resp.payload.user.ui });

            if (isDefined(userMember)) {
              this.memberQuery.update(resp.payload.userMember);
            }
            if (isDefined(struct)) {
              this.structQuery.update(resp.payload.struct);
            }
            if (isDefined(repo)) {
              this.repoQuery.update(resp.payload.repo);
            }

            if (user.isEmailVerified === true) {
              // console.log('startWatch from NavBarResolver');
              // this.authService.startWatch();
              return true;
            } else {
              this.router.navigate([PATH_VERIFY_EMAIL]);
              return false;
            }
          } else {
            return false;
          }
        })
      );
  }
}
