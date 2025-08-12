import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ChartService } from '~front/app/services/chart.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  standalone: false,
  selector: 'm-model-filters',
  templateUrl: './model-filters.component.html'
})
export class ModelFiltersComponent {
  @Input() modelContent: any;

  mconfig: common.MconfigX;

  chart: common.ChartX;
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
    filterExtended: common.FilterX,
    extendedFilterIndex: number,
    eventFractionUpdate: interfaces.EventFractionUpdate
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

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: common.QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          // fieldId: filterExtended.fieldId,
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

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }

  addFraction(filterExtended: common.FilterX, filterIndex: number) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFraction: common.Fraction;

    if (newMconfig.modelType === common.ModelTypeEnum.Store) {
      // if (newMconfig.isStoreModel === true) {
      let field = filterExtended.field;

      let storeFilter =
        field.fieldClass === common.FieldClassEnum.Filter
          ? (this.modelContent as common.FileStore).fields.find(
              f => f.name === field.id
            )
          : undefined;

      let storeResultFirstTypeFraction =
        field.fieldClass === common.FieldClassEnum.Filter
          ? undefined
          : (this.modelContent as common.FileStore).results.find(
              r => r.result === field.result
            ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : (this.modelContent as common.FileStore).results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.AndNot,
                value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: common.isUndefined(logicGroup)
          ? undefined
          : logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: field.result,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFirstTypeFraction?.type,
        storeFractionSubTypeLabel: common.isDefined(
          storeResultFirstTypeFraction?.type
        )
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFirstTypeFraction?.type
            ).label
          : storeResultFirstTypeFraction?.type,
        storeFractionLogicGroupWithSubType:
          common.isDefined(logicGroup) &&
          common.isDefined(storeResultFirstTypeFraction?.type)
            ? `${logicGroup}${common.TRIPLE_UNDERSCORE}${storeResultFirstTypeFraction.type}`
            : undefined,
        controls: common.isUndefined(storeResultFirstTypeFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: common.FractionControl = {
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
              let newControl: common.FractionControl = {
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
    } else if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(filterExtended.field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(filterExtended.field.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newFilter: common.Filter = {
      fieldId: filterExtended.fieldId,
      fractions: newFractions
    };

    let newFilters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: common.QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          // fieldId: filterExtended.fieldId,
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

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }

  deleteFraction(
    filterExtended: common.FilterX,
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

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: common.QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          // fieldId: filterExtended.fieldId,
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

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newMconfig = this.structService.makeMconfig();

    let newFilters = newMconfig.filters.filter(
      x => x.fieldId !== filterExtended.fieldId
    );

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: common.QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          // fieldId: filterExtended.fieldId,
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

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }
}
