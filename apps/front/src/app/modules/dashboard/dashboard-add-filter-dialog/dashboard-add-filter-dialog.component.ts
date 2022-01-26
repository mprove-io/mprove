import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { DashboardService } from '~front/app/services/dashboard.service';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-dashboard-add-filter-dialog',
  templateUrl: './dashboard-add-filter-dialog.component.html'
})
export class DashboardAddFilterDialogComponent implements OnInit {
  labelForm: FormGroup = this.fb.group({
    label: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: common.DashboardX;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard;

    setValueAndMark({
      control: this.labelForm.controls['label'],
      value: ''
    });
  }

  save() {
    if (this.labelForm.controls['label'].valid) {
      this.ref.close();

      let newLabel: string = this.labelForm.controls['label'].value;

      let newResult = common.FieldResultEnum.String;

      let newFraction: common.Fraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(newResult)
      };

      let newField: common.DashboardField = {
        id: 'abc',
        hidden: false,
        label: newLabel,
        result: newResult,
        fractions: [newFraction],
        description: ''
      };

      let dashboardService: DashboardService = this.ref.data.dashboardService;

      dashboardService.navCreateTempDashboard({
        dashboard: this.dashboard,
        oldDashboardId: this.dashboard.dashboardId,
        newDashboardId: common.makeId(),
        newDashboardFields: [...this.dashboard.fields, newField]
      });
    }
  }

  cancel() {
    this.ref.close();
  }
}
