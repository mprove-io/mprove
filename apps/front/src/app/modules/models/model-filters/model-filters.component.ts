import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { getFractionTypeForAny } from '#common/functions/get-fraction-type-for-any';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { FilterX } from '#common/interfaces/backend/filter-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { Filter } from '#common/interfaces/blockml/filter';
import { Fraction } from '#common/interfaces/blockml/fraction';
import { FractionControl } from '#common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '#common/interfaces/blockml/fraction-sub-type-option';
import { FileStore } from '#common/interfaces/blockml/internal/file-store';
import { EventFractionUpdate } from '#common/interfaces/front/event-fraction-update';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartService } from '~front/app/services/chart.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';

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

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.WhereOrHaving,
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

    if (newMconfig.modelType === ModelTypeEnum.Store) {
      let field = filterExtended.field;

      let storeFilter =
        field.fieldClass === FieldClassEnum.Filter
          ? this.storeContent.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFirstTypeFraction =
        field.fieldClass === FieldClassEnum.Filter
          ? undefined
          : this.storeContent.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : this.storeContent.results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.AndNot,
                value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === FractionLogicEnum.Or
            ? FractionOperatorEnum.Or
            : FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: FractionTypeEnum.StoreFraction,
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
    } else if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(filterExtended.field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(filterExtended.field.result)
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

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.WhereOrHaving,
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

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.WhereOrHaving,
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

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.WhereOrHaving,
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
