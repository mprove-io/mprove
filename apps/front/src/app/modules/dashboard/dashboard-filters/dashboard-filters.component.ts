import { Component, Input } from '@angular/core';
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
      deleteFilterMconfigId: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }

  addFraction(dashboardField: common.DashboardField, fieldIndex: number) {
    let fractions = dashboardField.fractions;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(dashboardField.result)
    };

    let newFractions = [...fractions, fraction];

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
      deleteFilterMconfigId: undefined,
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
      deleteFilterMconfigId: undefined,
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
      deleteFilterMconfigId: undefined,
      timezone: this.uiQuery.getValue().timezone
    });
  }
}
