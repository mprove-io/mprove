import { ChangeDetectorRef, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { QueryService } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';
import { RowData } from '../rep.component';

@Component({
  selector: 'm-data-renderer',
  templateUrl: './data-renderer.component.html'
})
export class DataRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams<RowData>;
  formattedValue: string;

  agInit(params: ICellRendererParams<RowData>) {
    this.applyFormat(params);
  }

  refresh(params: ICellRendererParams<RowData>) {
    this.applyFormat(params);
    return true;
  }

  applyFormat(params: ICellRendererParams<RowData>) {
    this.params = params;
    // console.log(params);
    this.formattedValue = common.isDefined(params.value)
      ? this.queryService.formatValue({
          value: params.value,
          formatNumber: params.data.formatNumber,
          fieldResult: common.FieldResultEnum.Number,
          currencyPrefix: params.data.currencyPrefix,
          currencySuffix: params.data.currencySuffix
        })
      : undefined;
  }

  constructor(
    private cd: ChangeDetectorRef,
    private queryService: QueryService
  ) {}
}
