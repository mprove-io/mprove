import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { ControlClassEnum } from '#common/enums/control-class.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeCopy } from '#common/functions/make-copy';
import { FilterX } from '#common/interfaces/backend/filter-x';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { DeleteFilterFnItem } from '#common/interfaces/front/delete-filter-fn-item';
import { ModelsQuery } from '#front/app/queries/models.query';

@Component({
  standalone: false,
  selector: 'm-bricks',
  templateUrl: './bricks.component.html'
})
export class BricksComponent implements OnChanges {
  @Input()
  extendedFilters: FilterX[];

  proFilters: FilterX[] = [];

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

  fractionOperatorEnum = FractionOperatorEnum;
  controlClassDatePicker = ControlClassEnum.DatePicker;

  constructor(private modelsQuery: ModelsQuery) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['extendedFilters'] && changes['extendedFilters'].currentValue) {
      let proFilters = makeCopy(this.extendedFilters);

      // deduplicate fractions with the same parent bricks
      proFilters.forEach(x => {
        let fractionsWithAny = x.fractions.filter(
          fraction =>
            isDefined(fraction.parentBrick) &&
            fraction.parentBrick === MALLOY_FILTER_ANY
        );

        let parentBricks: string[] = [];

        x.fractions
          .filter(
            fraction =>
              isDefined(fraction.parentBrick) &&
              fraction.parentBrick !== MALLOY_FILTER_ANY
          )
          .forEach(fraction => {
            parentBricks.push(fraction.parentBrick);
          });

        let uniqueParentBricks = [...new Set(parentBricks)];

        // fractions with unique parent bricks (but no any value)
        let proFractions: Fraction[] = [];

        uniqueParentBricks.forEach(parentBrick => {
          let proFraction = x.fractions.find(
            fraction => fraction.parentBrick === parentBrick
          );

          proFractions.push(proFraction);
        });

        proFractions = [...proFractions, ...fractionsWithAny];

        // fractions not modified if no fractionsWithUniqueParentBricks
        if (proFractions.length > 0) {
          x.fractions = proFractions;
        }
      });

      this.proFilters = proFilters;
    }
  }

  deleteFilter(filter: FilterX) {
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
