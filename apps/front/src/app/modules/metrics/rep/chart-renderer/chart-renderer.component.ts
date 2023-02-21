import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { DataRow } from '../rep.component';

@Component({
  selector: 'm-chart-renderer',
  templateUrl: './chart-renderer.component.html'
})
export class ChartRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<DataRow>;

  showChart = false;

  agInit(params: ICellRendererParams<DataRow>) {
    this.params = params;
  }

  refresh(params: ICellRendererParams<DataRow>) {
    this.params = params;
    return true;
  }

  toggleShowChart(event?: MouseEvent) {
    event.stopPropagation();
    this.showChart = !this.showChart;
  }
}
