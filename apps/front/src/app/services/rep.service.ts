import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { NavQuery, NavState } from '../queries/nav.query';
import { TimeQuery } from '../queries/time.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class RepService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private apiService: ApiService,
    private timeQuery: TimeQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private navQuery: NavQuery
  ) {
    this.nav$.subscribe();
  }

  navCreateDraftRep(item: { rows: common.Row[] }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { rows } = item;

    let timeState = this.timeQuery.getValue();

    let payload: apiToBackend.ToBackendCreateDraftRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      rows: rows,
      timezone: timeState.timezone,
      timeSpec: timeState.timeSpec,
      timeRangeFraction: timeState.timeRangeFraction
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDraftRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let rep = resp.payload.rep;
            this.navigateService.navigateToMetricsRep({
              repId: rep.repId,
              draft: rep.draft
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
