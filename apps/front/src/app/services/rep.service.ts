import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RepQuery } from '../queries/rep.query';
import { RepsQuery } from '../queries/reps.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
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
    private uiQuery: UiQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private structQuery: StructQuery,
    private repQuery: RepQuery,
    private repsQuery: RepsQuery
  ) {
    this.nav$.subscribe();
  }

  changeRows(item: {
    rep: common.RepX;
    changeType: common.ChangeTypeEnum;
    rowChanges: common.RowChange[];
  }) {
    let { rep, changeType, rowChanges } = item;

    if (rep.draft === true) {
      this.editDraftRep({
        repId: rep.repId,
        changeType: changeType,
        rowChanges: rowChanges
      });
    } else {
      this.navCreateDraftRep({
        fromRepId: rep.repId,
        fromDraft: rep.draft,
        changeType: changeType,
        rowChanges: rowChanges,
        selectNodes:
          changeType !== common.ChangeTypeEnum.Move &&
          changeType !== common.ChangeTypeEnum.Delete
            ? this.uiQuery.getValue().repSelectedNodes.map(node => node.id)
            : []
      });
    }
  }

  navCreateDraftRep(item: {
    changeType: common.ChangeTypeEnum;
    rowChanges: common.RowChange[];
    fromRepId: string;
    fromDraft: boolean;
    selectNodes: string[];
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { rowChanges, fromRepId, fromDraft, changeType, selectNodes } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendCreateDraftRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromRepId: fromRepId,
      fromDraft: fromDraft,
      rowChanges: rowChanges,
      changeType: changeType,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction
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

            let reps = this.repsQuery.getValue().reps;
            let newReps = [rep, ...reps];
            this.repsQuery.update({ reps: newReps });

            this.navigateService.navigateToMetricsRep({
              repId: rep.repId,
              draft: rep.draft,
              selectNodes: selectNodes
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftRep(item: {
    changeType: common.ChangeTypeEnum;
    rowChanges: common.RowChange[];
    repId: string;
  }) {
    let { rowChanges, repId, changeType } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendEditDraftRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repId: repId,
      changeType: changeType,
      rowChanges: rowChanges,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFraction: uiState.timeRangeFraction
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftRep,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditDraftRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.repQuery.update(resp.payload.rep);

            return true;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteRep(item: { repId: string }) {
    let { repId } = item;

    let rep = this.repQuery.getValue();

    let payload: apiToBackend.ToBackendDeleteDraftRepRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repId: repId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDraftRep,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDraftRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let reps = this.repsQuery.getValue().reps;

            let repIndex = reps.findIndex(x => x.repId === repId);

            let newReps = [
              ...reps.slice(0, repIndex),
              ...reps.slice(repIndex + 1)
            ];

            this.repsQuery.update({ reps: newReps });

            if (rep.repId === repId) {
              this.navigateService.navigateToMetricsRep({
                repId: common.EMPTY_REP_ID,
                draft: false,
                selectNodes: []
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
