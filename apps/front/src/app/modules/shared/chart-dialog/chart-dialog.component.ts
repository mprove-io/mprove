import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-chart-dialog',
  templateUrl: './chart-dialog.component.html'
})
export class ChartDialogComponent implements OnInit {
  chartTypeEnumTable = common.ChartTypeEnum.Table;

  isShow = true;
  isData = false;
  isFormat = true;

  sortedColumns: interfaces.ColumnField[];
  qData: RData[];
  query: common.Query;
  mconfig: common.Mconfig;
  model: common.Model;
  extendedFilters: interfaces.FilterExtended[];

  constructor(public ref: DialogRef, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.sortedColumns = this.ref.data.sortedColumns;
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
    this.model = this.ref.data.model;

    this.extendedFilters = getExtendedFilters({
      fields: this.model.fields,
      mconfig: this.mconfig
    });
  }

  toggleData() {
    this.isData = !this.isData;
    this.refreshShow();
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleFormat() {
    this.isFormat = !this.isFormat;
  }
}
