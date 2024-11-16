import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportQuery } from '../queries/report.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
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
    private repQuery: ReportQuery,
    private repsQuery: ReportsQuery
  ) {
    this.nav$.subscribe();
  }

  modifyRows(item: {
    rep: common.ReportX;
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
  }) {
    let { rep, changeType, rowChange, rowIds } = item;

    if (rep.draft === true) {
      this.editDraftRep({
        repId: rep.repId,
        changeType: changeType,
        rowIds: rowIds,
        rowChange: rowChange
      });
    } else {
      this.navCreateDraftRep({
        fromRepId: rep.repId,
        changeType: changeType,
        rowChange: rowChange,
        rowIds: rowIds,
        selectRows:
          changeType !== common.ChangeTypeEnum.Move &&
          changeType !== common.ChangeTypeEnum.Delete
            ? this.uiQuery.getValue().repSelectedNodes.map(node => node.id)
            : []
      });
    }
  }

  navCreateDraftRep(item: {
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
    fromRepId: string;
    selectRows: string[];
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { rowChange, rowIds, fromRepId, changeType, selectRows } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendCreateDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromRepId: fromRepId,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftRep,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDraftReportResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let rep = resp.payload.rep;

            let reps = this.repsQuery.getValue().reps;
            let newReps = [rep, ...reps];
            this.repsQuery.update({ reps: newReps });

            this.navigateService.navigateToMetricsRep({
              repId: rep.repId,
              selectRowsNodeIds: selectRows
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftRep(item: {
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
    repId: string;
  }) {
    let { rowChange, rowIds, repId, changeType } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendEditDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repId: repId,
      changeType: changeType,
      rowChange: rowChange,
      rowIds: rowIds,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftRep,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditDraftReportResponse) => {
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

  deleteDraftReps(item: { repIds: string[] }) {
    let { repIds } = item;

    let rep = this.repQuery.getValue();

    let payload: apiToBackend.ToBackendDeleteDraftReportsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repIds: repIds
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReps,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDraftReportsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let reps = this.repsQuery.getValue().reps;

            let newReps = [...reps];

            repIds.forEach(repId => {
              let repIndex = newReps.findIndex(x => x.repId === repId);

              newReps = [
                ...newReps.slice(0, repIndex),
                ...newReps.slice(repIndex + 1)
              ];
            });

            this.repsQuery.update({ reps: newReps });

            if (repIds.indexOf(rep.repId) > -1) {
              this.navigateService.navigateToMetricsRep({
                repId: common.EMPTY_REP_ID,
                selectRowsNodeIds: []
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
