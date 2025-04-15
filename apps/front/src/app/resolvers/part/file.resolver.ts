import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { UiQuery } from '~front/app/queries/ui.query';
import { common } from '~front/barrels/common';
import { checkNavOrgProjectRepoBranchEnv } from '../../functions/check-nav-org-project-repo-branch-env';
import { NavQuery, NavState } from '../../queries/nav.query';
import { UserQuery } from '../../queries/user.query';
import { FileService } from '../../services/file.service';

@Injectable({ providedIn: 'root' })
export class FileResolver implements Resolve<Observable<boolean>> {
  constructor(
    private fileService: FileService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
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

    let fileId: string = route.params[common.PARAMETER_FILE_ID];
    let panel: common.PanelEnum = route.queryParams?.panel;

    this.uiQuery.updatePart({
      panel: panel || common.PanelEnum.Tree
    });

    return this.fileService
      .getFile({ fileId: fileId, panel: panel, skipCheck: true })
      .pipe(map(x => true));
  }
}
