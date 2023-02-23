import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';

@Component({
  selector: 'm-chart-settings',
  templateUrl: './chart-settings.component.html'
})
export class ChartSettingsComponent {
  showChartForSelectedRow = false;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showChartForSelectedRow = x.showChartForSelectedRow;

      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private repQuery: RepQuery
  ) {}

  toggleShowChartForSelectedRow() {
    let showChartForSelectedRow = !this.showChartForSelectedRow;

    let sNodes = this.uiQuery.getValue().repSelectedNodes;
    let gridData = this.uiQuery.getValue().gridData;
    let rep = this.repQuery.getValue();

    this.uiQuery.updatePart({
      showChartForSelectedRow: showChartForSelectedRow,
      repChartData: {
        rows:
          showChartForSelectedRow === true && sNodes.length === 1
            ? gridData.filter(
                row =>
                  sNodes.map(node => node.data.rowId).indexOf(row.rowId) > -1
              )
            : showChartForSelectedRow === true && sNodes.length > 1
            ? []
            : gridData.filter(row => row.showChart === true),
        columns: rep.columns
      }
    });
  }
}
