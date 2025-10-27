import { Component, Input } from '@angular/core';
import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import { UiQuery } from '~front/app/queries/ui.query';
import { DashboardService } from '~front/app/services/dashboard.service';

@Component({
  standalone: false,
  selector: 'm-dashboard-filters',
  templateUrl: './dashboard-filters.component.html'
})
export class DashboardFiltersComponent {
  @Input()
  dashboard: DashboardX;

  constructor(
    private dashboardService: DashboardService,
    private uiQuery: UiQuery
  ) {}

  getStoreContent(modelId: string) {
    return this.dashboard.storeModels.find(x => x.modelId === modelId)
      ?.storeContent;
  }

  fractionUpdate(
    dashboardField: DashboardField,
    fieldIndex: number,
    eventFractionUpdate: EventFractionUpdate
  ) {
    let fractions = dashboardField.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newField = Object.assign({}, dashboardField, {
      fractions: newFractions
    });

    let newDashboardFields = [
      ...this.dashboard.fields.slice(0, fieldIndex),
      newField,
      ...this.dashboard.fields.slice(fieldIndex + 1)
    ];

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: newDashboardFields,
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
    });
  }

  addFraction(dashboardField: DashboardField, fieldIndex: number) {
    let fractions = dashboardField.fractions;

    let newFraction: Fraction;

    if (isDefined(dashboardField.storeModel)) {
      let store = this.dashboard.storeModels.find(
        x => x.modelId === dashboardField.storeModel
      );

      let storeFilter = isDefined(dashboardField.storeFilter)
        ? store.storeContent.fields.find(
            f => f.name === dashboardField.storeFilter
          )
        : undefined;

      let storeResultFirstTypeFraction = isDefined(dashboardField.storeFilter)
        ? undefined
        : store.storeContent.results.find(
            r => r.result === dashboardField.storeResult
          ).fraction_types[0];

      let logicGroup = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : store.storeContent.results
            .find(r => r.result === dashboardField.storeResult)
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
        type: FractionTypeEnum.StoreFraction,
        storeResult: dashboardField.storeResult,
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
    } else {
      newFraction = {
        brick: 'any',
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(dashboardField.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newField = Object.assign({}, dashboardField, {
      fractions: newFractions
    });

    let newDashboardFields = [
      ...this.dashboard.fields.slice(0, fieldIndex),
      newField,
      ...this.dashboard.fields.slice(fieldIndex + 1)
    ];

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: newDashboardFields,
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
    });
  }

  deleteFraction(
    dashboardField: DashboardField,
    fieldIndex: number,
    fractionIndex: number
  ) {
    let fractions = dashboardField.fractions;

    let newDashboardFields: DashboardField[];

    if (fractions.length === 1) {
      newDashboardFields = [
        ...this.dashboard.fields.slice(0, fieldIndex),
        ...this.dashboard.fields.slice(fieldIndex + 1)
      ];

      this.dashboard.tiles.forEach(tile => {
        Object.keys(tile.listen).forEach(key => {
          if (tile.listen[key] === dashboardField.id) {
            delete tile.listen[key];
          }
        });
      });
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newField = Object.assign({}, dashboardField, {
        fractions: newFractions
      });

      newDashboardFields = [
        ...this.dashboard.fields.slice(0, fieldIndex),
        newField,
        ...this.dashboard.fields.slice(fieldIndex + 1)
      ];
    }

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: newDashboardFields,
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
    });
  }

  deleteFilter(dashboardField: DashboardField) {
    let newDashboardFields = this.dashboard.fields.filter(
      x => x.id !== dashboardField.id
    );

    this.dashboard.tiles.forEach(tile => {
      tile.deletedFilterFieldIds = [];

      Object.keys(tile.listen).forEach(key => {
        if (tile.listen[key] === dashboardField.id) {
          tile.deletedFilterFieldIds.push(key);
          delete tile.listen[key];
        }
      });
    });

    this.dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: newDashboardFields,
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
    });
  }
}
