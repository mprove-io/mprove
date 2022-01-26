import { Component, Input } from '@angular/core';
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

  constructor(private dashboardService: DashboardService) {}

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
      dashboard: this.dashboard,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields
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
      dashboard: this.dashboard,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields
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
      dashboard: this.dashboard,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: newDashboardFields
    });
  }
}
