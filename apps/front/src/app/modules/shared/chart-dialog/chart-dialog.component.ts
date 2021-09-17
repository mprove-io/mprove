import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html'
})
export class ChartDialogComponent implements OnInit {
  sortedColumns: interfaces.ColumnField[];
  qData: RData[];
  query: common.Query;
  mconfig: common.Mconfig;

  constructor(public ref: DialogRef) {}

  ngOnInit() {
    this.sortedColumns = this.ref.data.sortedColumns;
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
  }
}
