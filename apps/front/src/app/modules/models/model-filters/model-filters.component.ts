import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { FilterX } from '#common/types/backend/parts/filter/filter-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { FieldClass } from '#common/types/blockml/parts/field/field-class';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { getFractionTypeForAny } from '#front/app/functions/get-fraction-type-for-any';
import { ChartQuery } from '#front/app/queries/chart.query';
import { ChartService } from '#front/app/services/chart.service';
import { MconfigService } from '#front/app/services/mconfig.service';
import { StructService } from '#front/app/services/struct.service';

@Component({
  standalone: false,
  selector: 'm-model-filters',
  templateUrl: './model-filters.component.html'
})
export class ModelFiltersComponent {
  @Input() storeContent: FileStore;

  mconfig: MconfigX;

  chart: ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
      this.mconfig = x.tiles[0].mconfig;

      this.cd.detectChanges();
    })
  );

  constructor(
    private chartQuery: ChartQuery,
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private chartService: ChartService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: FilterX,
    extendedFilterIndex: number,
    eventFractionUpdate: EventFractionUpdate
  ) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newFilter = Object.assign({}, filterExtended, {
      fractions: newFractions
    });

    let filterIndex = newMconfig.filters
      .map(y => y.fieldId)
      .indexOf(filterExtended.fieldId);

    let newFilters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: 'WhereOrHaving',
          timezone: newMconfig.timezone,
          filters: newFilters
        }
      });
    } else {
      newMconfig.filters = newFilters;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }

  addFraction(filterExtended: FilterX, filterIndex: number) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFraction: Fraction;

    if (newMconfig.modelType === 'Store') {
      let field = filterExtended.field;

      let storeFilter =
        field.fieldClass === ('filter' satisfies FieldClass)
          ? this.storeContent.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFirstTypeFraction =
        field.fieldClass === ('filter' satisfies FieldClass)
          ? undefined
          : this.storeContent.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup: FractionLogic = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : 'OR';

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : this.storeContent.results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: 'OR',
                typeValue: ft.type,
                value: `${'OR' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: 'AND_NOT',
                value: `${'AND_NOT' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === 'OR' ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === 'OR'
            ? 'Or'
            : 'And',
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: 'StoreFraction',
        storeResult: field.result,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFirstTypeFraction?.type,
        storeFractionSubTypeLabel: isDefined(storeResultFirstTypeFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFirstTypeFraction?.type
            ).label
          : storeResultFirstTypeFraction?.type,
        storeFractionLogicGroupWithSubType:
          isDefined(logicGroup) && isDefined(storeResultFirstTypeFraction?.type)
            ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFirstTypeFraction.type}`
            : undefined,
        controls: isUndefined(storeResultFirstTypeFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: FractionControl = {
                options: control.options,
                value: control.value,
                label: control.label,
                required: control.required,
                name: control.name,
                controlClass: control.controlClass,
                isMetricsDate: control.isMetricsDate
              };
              return newControl;
            })
          : storeResultFirstTypeFraction.controls.map(control => {
              let newControl: FractionControl = {
                options: control.options,
                value: control.value,
                label: control.label,
                required: control.required,
                name: control.name,
                controlClass: control.controlClass,
                isMetricsDate: control.isMetricsDate
              };
              return newControl;
            })
      };
    } else if (newMconfig.modelType === 'Malloy') {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: 'Or',
        type: getFractionTypeForAny({ result: filterExtended.field.result })
      };
    } else {
      newFraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: 'Or',
        type: getFractionTypeForAny({ result: filterExtended.field.result })
      };
    }

    let newFractions = [...fractions, newFraction];

    let newFilter: Filter = {
      fieldId: filterExtended.fieldId,
      fractions: newFractions
    };

    let newFilters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: 'WhereOrHaving',
          timezone: newMconfig.timezone,
          filters: newFilters
        }
      });
    } else {
      newMconfig.filters = newFilters;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }

  deleteFraction(
    filterExtended: FilterX,
    filterIndex: number,
    fractionIndex: number
  ) {
    let newMconfig = this.structService.makeMconfig();

    let newFilters = [...newMconfig.filters];

    let fractions = filterExtended.fractions;

    if (fractions.length === 1) {
      newFilters = [
        ...newFilters.slice(0, filterIndex),
        ...newFilters.slice(filterIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newFilter = Object.assign({}, filterExtended, {
        fractions: newFractions
      });

      newFilters = [
        ...newFilters.slice(0, filterIndex),
        newFilter,
        ...newFilters.slice(filterIndex + 1)
      ];
    }

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: 'WhereOrHaving',
          timezone: newMconfig.timezone,
          filters: newFilters
        }
      });
    } else {
      newMconfig.filters = newFilters;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }

  deleteFilter(filterExtended: FilterX) {
    let newMconfig = this.structService.makeMconfig();

    let newFilters = newMconfig.filters.filter(
      x => x.fieldId !== filterExtended.fieldId
    );

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: 'WhereOrHaving',
          timezone: newMconfig.timezone,
          filters: newFilters
        }
      });
    } else {
      newMconfig.filters = newFilters;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
  }
}
