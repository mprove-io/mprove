import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap
} from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class QueryResolver implements Resolve<boolean | Observable<boolean>> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private backendService: services.BackendService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | Observable<boolean>> {
    this.printer.log(enums.busEnum.QUERY_SELECTED_RESOLVER, 'starts...');

    // this.store.select(selectors.getLayoutChartId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutChartIdAction(undefined)) : 0);

    this.printer.log(
      enums.busEnum.QUERY_SELECTED_RESOLVER,
      'queryId:',
      route.params['queryId']
    );

    let mconfigId: string;
    this.store
      .select(selectors.getLayoutMconfigId)
      .pipe(take(1))
      .subscribe(x => (mconfigId = x));

    if (!mconfigId) {
      this.printer.log(
        enums.busEnum.QUERY_SELECTED_RESOLVER,
        `mconfigId undefined`
      );
      this.printer.log(
        enums.busEnum.QUERY_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.hasQuery(route.params['queryId']))
    );
  }

  /**
   * `hasQuery` composes `hasQueryInStore` and `hasQueryInApi`. It first checks
   * if the query is in store, and if not it then checks if it is in the
   * API.
   */
  hasQuery(id: string): Observable<boolean | Observable<boolean>> {
    return this.hasQueryInStore(id).pipe(
      switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        } else {
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `query not exists in Store, getting from API...`
          );
          return this.hasQueryInApi(id);
        }
      })
    );
  }

  /**
   * This method checks if a query with the given queryId is already registered
   * in the Store and is not Deleted
   */
  hasQueryInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getQueriesState).pipe(
      mergeMap(queries => {
        let exists = queries.findIndex(query => query.query_id === id) > -1;

        if (!exists) {
          return of(false);
        } else {
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `query exists in Store`
          );
          return this.selectQueryId(id);
        }
      }),
      take(1)
    );
  }

  /**
   * This method loads a query with the given ID from the API and caches
   * it in the store, returning `true` or `false` if it was found.
   */
  hasQueryInApi(id: string): Observable<boolean | Observable<boolean>> {
    return this.backendService.getQueryWithDepQueries({ query_id: id }).pipe(
      map(body => new actions.UpdateQueriesStateAction(body.payload.queries)),
      tap(action => this.store.dispatch(action)),
      map(action => {
        if (action.payload.length > 0) {
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `query loaded from API`
          );

          // we set live queries in query component without dep pdts
          // because we need only sql from dep pdts while on query component

          return this.selectQueryId(id);
        } else {
          this.store
            .select(selectors.getLayoutQueryId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutQueryIdAction(undefined)
                  )
                : 0
            );

          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `got empty queries from API`
          );
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `resolved (false)`
          );

          this.router.navigate(['/404']);
          return of(false);
        }
      }),
      catchError(() => {
        this.store
          .select(selectors.getLayoutQueryId)
          .pipe(take(1))
          .subscribe(x =>
            x
              ? this.store.dispatch(
                  new actions.UpdateLayoutQueryIdAction(undefined)
                )
              : 0
          );

        this.printer.log(
          enums.busEnum.QUERY_SELECTED_RESOLVER,
          `caught error accessing API`
        );
        this.printer.log(
          enums.busEnum.QUERY_SELECTED_RESOLVER,
          `resolved (false)`
        );
        this.router.navigate(['/404']);
        return of(false);
      })
    );
  }

  selectQueryId(id: string): Observable<boolean> {
    let layoutQueryId: string;
    this.store
      .select(selectors.getLayoutQueryId)
      .pipe(take(1))
      .subscribe(queryId => (layoutQueryId = queryId));

    if (id !== layoutQueryId) {
      this.printer.log(
        enums.busEnum.QUERY_SELECTED_RESOLVER,
        `selecting query...`
      );
      this.store.dispatch(new actions.UpdateLayoutQueryIdAction(id));

      return this.store.select(selectors.getLayoutQueryId).pipe(
        filter(selectedQueryId => selectedQueryId === id),
        map(() => true),
        tap(x => {
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `query selected`
          );
          this.printer.log(
            enums.busEnum.QUERY_SELECTED_RESOLVER,
            `resolved (true)`
          );
        }),
        take(1)
      );
    } else {
      this.printer.log(
        enums.busEnum.QUERY_SELECTED_RESOLVER,
        `query already selected`
      );
      this.printer.log(
        enums.busEnum.QUERY_SELECTED_RESOLVER,
        `resolved (true)`
      );
      return of(true);
    }
  }
}
