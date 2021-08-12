import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { ColumnField } from '~front/app/queries/mq.query';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html'
})
export class ChartDialogComponent implements OnInit {
  title: string;
  sortedColumns: ColumnField[];
  qData: RData[];
  query: common.Query;
  mconfig: common.Mconfig;

  constructor(public ref: DialogRef) {}

  ngOnInit() {
    this.title = this.ref.data.title;
    this.sortedColumns = this.ref.data.sortedColumns;
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
  }
}
