import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DeleteFilterFnItem } from '~front/app/interfaces/delete-filter-fn-item';
import { ModelsQuery } from '~front/app/queries/models.query';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-bricks',
  templateUrl: './bricks.component.html'
})
export class BricksComponent implements OnChanges {
  @Input()
  extendedFilters: common.FilterX[];

  proFilters: common.FilterX[] = [];

  @Input()
  listen: { [a: string]: string };

  @Input()
  tileTitle: string;

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
  controlClassDatePicker = common.ControlClassEnum.DatePicker;

  constructor(private modelsQuery: ModelsQuery) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['extendedFilters'] && changes['extendedFilters'].currentValue) {
      let proFilters = common.makeCopy(this.extendedFilters);

      // deduplicate fractions with the same parent bricks
      proFilters.forEach(x => {
        let parentBricks: string[] = [];

        x.fractions
          .filter(fraction => common.isDefined(fraction.parentBrick))
          .forEach(fraction => {
            parentBricks.push(fraction.parentBrick);
          });

        let uniqueParentBricks = [...new Set(parentBricks)];

        // fractions with unique parent bricks
        let proFractions: common.Fraction[] = [];

        uniqueParentBricks.forEach(parentBrick => {
          let proFraction = x.fractions.find(
            fraction => fraction.parentBrick === parentBrick
          );

          proFractions.push(proFraction);
        });

        // fractions not modified if no fractionsWithUniqueParentBricks
        if (proFractions.length > 0) {
          x.fractions = proFractions;
        }
      });

      this.proFilters = proFilters;
    }
  }

  deleteFilter(filter: common.FilterX) {
    this.extendedFilters = this.extendedFilters.filter(
      x => x.fieldId !== filter.fieldId
    );

    this.deleteFilterFn({
      filterFieldId: filter.fieldId,
      tileTitle: this.tileTitle
    });
  }

  getMetricsEndDateYYYYMMDD(storeId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === storeId)
      ?.dateRangeIncludesRightSide === true
      ? this.metricsEndDateIncludedYYYYMMDD
      : this.metricsEndDateExcludedYYYYMMDD;
  }
}
