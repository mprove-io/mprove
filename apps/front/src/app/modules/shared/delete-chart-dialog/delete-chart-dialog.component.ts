import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import type { ToBackendDeleteChartInput } from '#common/zod/backend/routes/charts/delete-chart/delete-chart-request';
import type { ToBackendDeleteChartResponse } from '#common/zod/backend/routes/charts/delete-chart/delete-chart-response';
import { ChartQuery } from '#front/app/queries/chart.query';
import { ChartsQuery } from '#front/app/queries/charts.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

export interface DeleteChartDialogData {
  apiService: ApiService;
  chart: ChartUnit;
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  repoType: RepoTypeEnum;
}

@Component({
  selector: 'm-delete-chart-dialog',
  templateUrl: './delete-chart-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteChartDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteChartDialogData>,
    private navigateService: NavigateService,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let { projectId, branchId, repoId } = this.ref.data;

    let chart = this.ref.data.chart;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteChartInput = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      repoId: repoId,
      chartId: chart.chartId
    };

    apiService
      .req({
        route: 'api/ToBackendDeleteChart',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteChartResponse) => {
          if (resp.result?.type === 'Success') {
            this.chartsQuery.update({
              chartUnitDrafts: resp.result.value.chartUnitDrafts,
              chartSpaceNodes: resp.result.value.chartSpaceNodes
            });

            let currentChart = this.chartQuery.getValue();

            if (currentChart.chartId === chart.chartId) {
              this.uiService.setProjectChartLink({ chartId: EMPTY_CHART_ID });

              this.navigateService.navigateToChart({
                modelId: chart.modelId,
                chartId: EMPTY_CHART_ID
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
