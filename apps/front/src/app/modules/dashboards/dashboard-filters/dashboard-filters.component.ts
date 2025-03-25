import { Component, Input } from '@angular/core';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { UiQuery } from '~front/app/queries/ui.query';
import { DashboardService } from '~front/app/services/dashboard.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-dashboard-filters',
  templateUrl: './dashboard-filters.component.html'
})
export class DashboardFiltersComponent {
  @Input()
  dashboard: common.DashboardX;

  constructor(
    private dashboardService: DashboardService,
    private uiQuery: UiQuery
  ) {}

  getModelContent(storeId: string) {
    return this.dashboard.storeModels.find(x => x.modelId === storeId)?.content;
  }

  fractionUpdate(
    dashboardField: common.DashboardField,
    fieldIndex: number,
    eventFractionUpdate: interfaces.EventFractionUpdate
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

    this.dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields,
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  addFraction(dashboardField: common.DashboardField, fieldIndex: number) {
    let fractions = dashboardField.fractions;

    let newFraction: common.Fraction;

    if (common.isDefined(dashboardField.storeModel)) {
      let store = this.dashboard.storeModels.find(
        x => x.modelId === dashboardField.storeModel
      );

      let storeFilter = common.isDefined(dashboardField.storeFilter)
        ? (store.content as common.FileStore).fields.find(
            f => f.name === dashboardField.storeFilter
          )
        : undefined;

      let storeResultFirstTypeFraction = common.isDefined(
        dashboardField.storeFilter
      )
        ? undefined
        : (store.content as common.FileStore).results.find(
            r => r.result === dashboardField.storeResult
          ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : (store.content as common.FileStore).results
            .find(r => r.result === dashboardField.storeResult)
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
        storeResult: dashboardField.storeResult,
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
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(dashboardField.result)
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

    this.dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields,
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  deleteFraction(
    dashboardField: common.DashboardField,
    fieldIndex: number,
    fractionIndex: number
  ) {
    let fractions = dashboardField.fractions;

    let newDashboardFields: common.DashboardField[];

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

    this.dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields,
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  deleteFilter(dashboardField: common.DashboardField) {
    let newDashboardFields = this.dashboard.fields.filter(
      x => x.id !== dashboardField.id
    );

    this.dashboard.tiles.forEach(tile => {
      Object.keys(tile.listen).forEach(key => {
        if (tile.listen[key] === dashboardField.id) {
          delete tile.listen[key];
        }
      });
    });

    this.dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields,
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }
}
