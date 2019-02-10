import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class PDTResolver implements Resolve<any> {
  constructor(
    private printer: services.PrinterService,
    private liveQueriesService: services.LiveQueriesService,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private backendService: services.BackendService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.printer.log(enums.busEnum.PDT_RESOLVER, 'starts...');

    let bqProject: string;
    this.store
      .select(selectors.getSelectedProjectBqProject)
      .pipe(take(1))
      .subscribe(x => (bqProject = x));

    if (!bqProject) {
      this.printer.log(
        enums.busEnum.PDT_RESOLVER,
        `bqProject empty, navigating profile...`
      );
      this.router.navigate(['/profile']);

      this.myDialogService.showBqDialog();
      this.printer.log(enums.busEnum.PDT_RESOLVER, `resolved (false)`);
      return of(false);
    }

    let projectId: string;
    this.store
      .select(selectors.getLayoutProjectId)
      .pipe(take(1))
      .subscribe(x => (projectId = x));

    let structId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoStructId)
      .pipe(take(1))
      .subscribe(x => (structId = x));

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => {
        this.printer.log(enums.busEnum.PDT_RESOLVER, `getting from API...`);
        return this.hasPDTsInApi(projectId, structId);
      })
    );
  }

  hasPDTsInApi(
    projectId: string,
    structId: string
  ): Observable<boolean | Observable<boolean>> {
    return this.backendService
      .getPdtQueries({
        project_id: projectId,
        struct_id: structId
      })
      .pipe(
        map(body => {
          const queries = body.payload.queries;
          this.store.dispatch(new actions.UpdateQueriesStateAction(queries));
          this.printer.log(
            enums.busEnum.PDT_RESOLVER,
            `pdt queries loaded from API`
          );

          let queryIds = queries.map(q => q.query_id);
          if (queryIds.length > 0) {
            this.liveQueriesService.setLiveQueries(queryIds);
          }

          return of(true);
        }),
        catchError(() => {
          this.printer.log(
            enums.busEnum.PDT_RESOLVER,
            `caught error accessing API`
          );
          this.printer.log(enums.busEnum.PDT_RESOLVER, `resolved (false)`);
          this.router.navigate(['/404']);
          return of(false);
        })
      );
  }
}
