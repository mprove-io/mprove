import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { Chart } from '~common/interfaces/blockml/chart';
import {
  ToBackendSaveModifyChartRequestPayload,
  ToBackendSaveModifyChartResponse
} from '~common/interfaces/to-backend/charts/to-backend-save-modify-chart';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { SharedModule } from '../shared.module';

export interface EditChartInfoDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  envId: string;
  chart: Chart;
}

@Component({
  selector: 'm-edit-chart-info-dialog',
  templateUrl: './edit-chart-info-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditChartInfoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  // rolesForm: FormGroup = this.fb.group({
  //   roles: [undefined, [Validators.maxLength(255)]]
  // });

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<EditChartInfoDialogData>,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private uiQuery: UiQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef,
    private navigateService: NavigateService
  ) {}

  ngOnInit() {
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.chart.title
    });
    // setValueAndMark({
    //   control: this.rolesForm.controls['roles'],
    //   value: this.ref.data.chart.accessRoles?.join(', ')
    // });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid
      // &&
      // this.rolesForm.controls['roles'].valid
    ) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let newTitle: string = this.titleForm.controls['title'].value;
      // let roles: string = this.rolesForm.controls['roles'].value;

      let uiState = this.uiQuery.getValue();

      let payload: ToBackendSaveModifyChartRequestPayload = {
        projectId: this.ref.data.projectId,
        isRepoProd: this.ref.data.isRepoProd,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromChartId: this.ref.data.chart.chartId,
        chartId: this.ref.data.chart.chartId,
        tileTitle: newTitle.trim(),
        timezone: uiState.timezone
        // accessRoles: roles
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: ToBackendSaveModifyChartResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              let newChart = resp.payload.chart;
              let newChartPart = resp.payload.chartPart;

              if (isDefined(newChart)) {
                let charts = this.chartsQuery.getValue().charts;

                let newCharts = [
                  newChartPart,
                  ...charts.filter(x => x.chartId !== newChartPart.chartId)
                ];

                this.chartsQuery.update({ charts: newCharts });

                let currentChart = this.chartQuery.getValue();

                if (currentChart.chartId === newChart.chartId) {
                  this.chartQuery.update(newChart);
                }
              }
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  cancel() {
    this.ref.close();
  }
}
