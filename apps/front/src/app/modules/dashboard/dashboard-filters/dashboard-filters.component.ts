import { Component, Input } from '@angular/core';
import { DashboardService } from '~front/app/services/dashboard.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { DashboardExtended } from '../../dashboards/dashboards.component';

@Component({
  selector: 'm-dashboard-filters',
  templateUrl: './dashboard-filters.component.html'
})
export class DashboardFiltersComponent {
  @Input()
  dashboard: DashboardExtended;

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
      type:
        dashboardField.result === common.FieldResultEnum.DayOfWeek
          ? common.FractionTypeEnum.DayOfWeekIsAnyValue
          : dashboardField.result === common.FieldResultEnum.DayOfWeekIndex
          ? common.FractionTypeEnum.DayOfWeekIndexIsAnyValue
          : dashboardField.result === common.FieldResultEnum.MonthName
          ? common.FractionTypeEnum.MonthNameIsAnyValue
          : dashboardField.result === common.FieldResultEnum.Number
          ? common.FractionTypeEnum.NumberIsAnyValue
          : dashboardField.result === common.FieldResultEnum.QuarterOfYear
          ? common.FractionTypeEnum.QuarterOfYearIsAnyValue
          : dashboardField.result === common.FieldResultEnum.String
          ? common.FractionTypeEnum.StringIsAnyValue
          : dashboardField.result === common.FieldResultEnum.Ts
          ? common.FractionTypeEnum.TsIsAnyValue
          : dashboardField.result === common.FieldResultEnum.Yesno
          ? common.FractionTypeEnum.YesnoIsAnyValue
          : undefined
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
