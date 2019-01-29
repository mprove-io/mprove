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
import { BackendService } from '@app/services/backend.service';
import { PrinterService } from '@app/services/printer.service';

@Injectable()
export class MconfigResolver implements Resolve<boolean | Observable<boolean>> {
  constructor(
    private printer: PrinterService,
    private store: Store<interfaces.AppState>,
    private backendService: BackendService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | Observable<boolean>> {
    this.printer.log(enums.busEnum.MCONFIG_SELECTED_RESOLVER, 'starts...');

    // this.store.select(selectors.getLayoutChartId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutChartIdAction(undefined)) : 0);

    // this.store.select(selectors.getLayoutQueryId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutQueryIdAction(undefined)) : 0);

    this.printer.log(
      enums.busEnum.MCONFIG_SELECTED_RESOLVER,
      'mconfigId:',
      route.params['mconfigId']
    );

    let modelId: string;
    this.store
      .select(selectors.getLayoutModelId)
      .pipe(take(1))
      .subscribe(x => (modelId = x));

    if (!modelId) {
      this.printer.log(
        enums.busEnum.MCONFIG_SELECTED_RESOLVER,
        `modelId undefined`
      );
      this.printer.log(
        enums.busEnum.MCONFIG_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.hasMconfig(route.params['mconfigId']))
    );
  }

  /**
   * `hasMconfig` composes `hasMconfigInStore` and `hasMconfigInApi`. It first checks
   * if the mconfig is in store, and if not it then checks if it is in the
   * API.
   */
  hasMconfig(id: string): Observable<boolean | Observable<boolean>> {
    return this.hasMconfigInStore(id).pipe(
      switchMap(inStore => {
        if (inStore) {
          return of(inStore);
        } else {
          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `mconfig not exists in Store, getting from API...`
          );
          return this.hasMconfigInApi(id);
        }
      })
    );
  }

  /**
   * This method checks if a mconfig with the given mconfigId is already registered
   * in the Store and is not Deleted
   */
  hasMconfigInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getMconfigsState).pipe(
      mergeMap(mconfigs => {
        let exists =
          mconfigs.findIndex(mconfig => mconfig.mconfig_id === id) > -1;

        if (!exists) {
          return of(false);
        } else {
          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `mconfig exists in Store`
          );
          return this.selectMconfigId(id);
        }
      }),
      take(1)
    );
  }

  /**
   * This method loads a mconfig with the given ID from the API and caches
   * it in the store, returning `true` or `false` if it was found.
   */
  hasMconfigInApi(id: string): Observable<boolean | Observable<boolean>> {
    return this.backendService.getMconfig({ mconfig_id: id }).pipe(
      map(body => {
        if (body.payload.mconfig_or_empty.length > 0) {
          this.store.dispatch(
            new actions.UpdateMconfigsStateAction(body.payload.mconfig_or_empty)
          );

          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `mconfig loaded from API`
          );
          return this.selectMconfigId(id);
        } else {
          this.store
            .select(selectors.getLayoutMconfigId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutMconfigIdAction(undefined)
                  )
                : 0
            );

          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `got empty mconfigs from API`
          );
          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `resolved (false)`
          );
          this.router.navigate(['/404']);
          return of(false);
        }
      }),
      catchError(() => {
        this.store
          .select(selectors.getLayoutMconfigId)
          .pipe(take(1))
          .subscribe(x =>
            x
              ? this.store.dispatch(
                  new actions.UpdateLayoutMconfigIdAction(undefined)
                )
              : 0
          );

        this.printer.log(
          enums.busEnum.MCONFIG_SELECTED_RESOLVER,
          `caught error accessing API`
        );
        this.printer.log(
          enums.busEnum.MCONFIG_SELECTED_RESOLVER,
          `resolved (false)`
        );
        this.router.navigate(['/404']);
        return of(false);
      })
    );
  }

  selectMconfigId(id: string): Observable<boolean> {
    let layoutMconfigId: string;
    this.store
      .select(selectors.getLayoutMconfigId)
      .pipe(take(1))
      .subscribe(mconfigId => (layoutMconfigId = mconfigId));

    if (id !== layoutMconfigId) {
      this.printer.log(
        enums.busEnum.MCONFIG_SELECTED_RESOLVER,
        `selecting mconfig...`
      );
      this.store.dispatch(new actions.UpdateLayoutMconfigIdAction(id));

      return this.store.select(selectors.getLayoutMconfigId).pipe(
        filter(selectedMconfigId => selectedMconfigId === id),
        map(() => true),
        tap(x => {
          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `mconfig selected`
          );
          this.printer.log(
            enums.busEnum.MCONFIG_SELECTED_RESOLVER,
            `resolved (true)`
          );
        }),
        take(1)
      );
    } else {
      this.printer.log(
        enums.busEnum.MCONFIG_SELECTED_RESOLVER,
        `mconfig already selected`
      );
      this.printer.log(
        enums.busEnum.MCONFIG_SELECTED_RESOLVER,
        `resolved (true)`
      );
      return of(true);
    }
  }
}
