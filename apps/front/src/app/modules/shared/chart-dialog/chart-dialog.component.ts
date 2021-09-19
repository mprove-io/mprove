import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { NavigateService } from '~front/app/services/navigate.service';
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
  showNav = false;

  sortedColumns: interfaces.ColumnField[];
  canAccessModel: boolean;
  qData: RData[];
  query: common.Query;
  mconfig: common.Mconfig;
  model: common.Model;
  extendedFilters: interfaces.FilterExtended[];

  constructor(
    public ref: DialogRef,
    private cd: ChangeDetectorRef,
    private navigateService: NavigateService
  ) {}

  ngOnInit() {
    this.sortedColumns = this.ref.data.sortedColumns;
    this.qData = this.ref.data.qData;
    this.mconfig = this.ref.data.mconfig;
    this.query = this.ref.data.query;
    this.model = this.ref.data.model;
    this.canAccessModel = this.ref.data.canAccessModel;
    this.showNav = this.ref.data.showNav;

    this.extendedFilters = getExtendedFilters({
      fields: this.model.fields,
      mconfig: this.mconfig
    });

    // removes scroll for gauge chart
    this.refreshShow();
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

  explore(event?: MouseEvent) {
    this.ref.close();

    if (this.canAccessModel === true) {
      this.navigateService.navigateMconfigQueryData({
        modelId: this.model.modelId,
        mconfigId: this.mconfig.mconfigId,
        queryId: this.query.queryId
      });
    }
  }
}
