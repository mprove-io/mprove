import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { NavigateService } from '~front/app/services/navigate.service';
import { RData } from '~front/app/services/query.service';
import { ModelStore } from '~front/app/stores/model.store';
import { MqStore } from '~front/app/stores/mq.store';
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
    private navigateService: NavigateService,
    private mqStore: MqStore,
    private modelStore: ModelStore
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

    this.modelStore.update(this.model);

    this.mqStore.update(state =>
      Object.assign({}, state, { mconfig: this.mconfig, query: this.query })
    );

    if (this.canAccessModel === true) {
      this.navigateService.navigateMconfigQuery({
        modelId: this.model.modelId,
        mconfigId: this.mconfig.mconfigId,
        queryId: this.query.queryId
      });
    }
  }
}
