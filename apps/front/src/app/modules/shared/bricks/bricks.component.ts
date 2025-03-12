import { Component, Input } from '@angular/core';
import { DeleteFilterFnItem } from '~front/app/interfaces/delete-filter-fn-item';
import { ModelsQuery } from '~front/app/queries/models.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-bricks',
  templateUrl: './bricks.component.html'
})
export class BricksComponent {
  @Input()
  extendedFilters: common.FilterX[];

  @Input()
  listen: { [a: string]: string };

  @Input()
  formulas: { [a: string]: boolean };

  @Input()
  tileTitle: string;

  @Input()
  showJson?: boolean;

  @Input()
  onlyJson?: boolean;

  @Input()
  parametersJson?: any[];

  @Input()
  jsonMaxHeight?: number;

  @Input()
  deleteFilterFn: (item: DeleteFilterFnItem) => void;

  @Input()
  isKeepBackgroundColor: boolean;

  @Input()
  metricsStartDateYYYYMMDD: string;

  @Input()
  metricsEndDateExcludedYYYYMMDD: string;

  @Input()
  metricsEndDateIncludedYYYYMMDD: string;

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor(private modelsQuery: ModelsQuery) {}

  deleteFilter(filter: common.FilterX) {
    this.deleteFilterFn({
      filterFieldId: filter.fieldId,
      tileTitle: this.tileTitle
    });
  }

  getModelDateRangeIncludesRightSide(storeId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === storeId)
      ?.dateRangeIncludesRightSide === true
      ? this.metricsEndDateIncludedYYYYMMDD
      : this.metricsEndDateExcludedYYYYMMDD;
  }
}
