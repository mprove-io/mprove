import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
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

    let panel: common.PanelEnum = route.queryParams?.panel;
    this.uiQuery.updatePart({ panel: panel || common.PanelEnum.Tree });

    let parametersFileId: string = route.params[common.PARAMETER_FILE_ID];

    if (parametersFileId === common.LAST_SELECTED_FILE_ID) {
      let repo = this.repoQuery.getValue();

      let fileIds = common.getFileIds({ nodes: repo.nodes });

      let projectFileLinks = this.uiQuery.getValue().projectFileLinks;

      let pLink = projectFileLinks.find(
        link => link.projectId === nav.projectId
      );

      if (common.isDefined(pLink)) {
        let pFileId = fileIds.find(fileId => fileId === pLink.fileId);

        if (common.isDefined(pFileId)) {
          this.navigateService.navigateToFileLine({
            panel: common.PanelEnum.Tree,
            encodedFileId: pFileId
          });
        } else {
          this.navigateService.navigateToFiles();
        }

        return of(false);
      } else {
        this.navigateService.navigateToFiles();

        return of(false);
      }
    }

    return this.fileService
      .getFile({ fileId: parametersFileId, panel: panel, skipCheck: true })
      .pipe(map(x => true));
  }
}
