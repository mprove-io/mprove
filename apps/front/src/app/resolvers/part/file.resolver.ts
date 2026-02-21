import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { PARAMETER_FILE_ID } from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { getFileIds } from '#common/functions/get-file-ids';
import { isDefined } from '#common/functions/is-defined';
import { RepoQuery } from '#front/app/queries/repo.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { checkNavOrgProjectRepoBranchEnv } from '../../functions/check-nav-org-project-repo-branch-env';
import { NavQuery, NavState } from '../../queries/nav.query';
import { UserQuery } from '../../queries/user.query';
import { FileService } from '../../services/file.service';

@Injectable({ providedIn: 'root' })
export class FileResolver implements Resolve<Observable<boolean>> {
  constructor(
    private fileService: FileService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private repoQuery: RepoQuery,
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

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    checkNavOrgProjectRepoBranchEnv({
      router: this.router,
      route: route,
      nav: nav,
      userId: userId
    });

    let left: BuilderLeftEnum = route.queryParams?.left;
    let right: BuilderRightEnum = route.queryParams?.right;

    if (isDefined(left)) {
      this.uiQuery.updatePart({ builderLeft: left });
    }
    if (isDefined(right)) {
      this.uiQuery.updatePart({ builderRight: right });
    }

    let parametersFileId: string = route.params[PARAMETER_FILE_ID];

    let repo = this.repoQuery.getValue();
    let fileIds = getFileIds({ nodes: repo.nodes });

    if (fileIds.indexOf(parametersFileId) < 0) {
      this.navigateService.navigateToBuilder({
        left: left || BuilderLeftEnum.Tree
      });
      return of(false);
    }

    return this.fileService
      .getFile({ fileId: parametersFileId, builderLeft: left, skipCheck: true })
      .pipe(map(x => true));
  }
}
