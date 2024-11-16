import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UiService } from '~front/app/services/ui.service';

@Component({
  selector: 'm-chart-settings',
  templateUrl: './chart-settings.component.html'
})
export class ChartSettingsComponent {
  showChartForSelectedRows = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showChartForSelectedRows = x.showChartForSelectedRows;

      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private repQuery: ReportQuery
  ) {}

  toggleShowChartForSelectedRows() {
    let showChartForSelectedRows = !this.showChartForSelectedRows;

    let sNodes = this.uiQuery.getValue().repSelectedNodes;
    let gridData = this.uiQuery.getValue().gridData;
    let rep = this.repQuery.getValue();

    this.uiQuery.updatePart({
      showChartForSelectedRows: showChartForSelectedRows,
      repChartData: {
        rows:
          showChartForSelectedRows === true && sNodes.length === 1
            ? gridData.filter(
                row =>
                  sNodes.map(node => node.data.rowId).indexOf(row.rowId) > -1
              )
            : showChartForSelectedRows === true && sNodes.length > 1
            ? []
            : gridData.filter(row => row.showChart === true),
        columns: rep.columns
      }
    });

    this.uiService.setUserUi({
      showChartForSelectedRows: showChartForSelectedRows
    });
  }
}
