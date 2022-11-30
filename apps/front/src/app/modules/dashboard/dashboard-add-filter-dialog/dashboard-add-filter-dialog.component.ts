import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { DashboardService } from '~front/app/services/dashboard.service';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: common.DashboardX;
}

@Component({
  selector: 'm-dashboard-add-filter-dialog',
  templateUrl: './dashboard-add-filter-dialog.component.html'
})
export class DashboardAddFilterDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  filterForm: FormGroup;

  resultList = constants.RESULT_LIST;

  fieldResult = common.FieldResultEnum.Number;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: common.DashboardX;

  constructor(
    public ref: DialogRef<DashboardAddFilterDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard;

    // setValueAndMark({
    //   control: this.labelForm.controls['label'],
    //   value: ''
    // });

    this.filterForm = this.fb.group(
      {
        label: [undefined, [Validators.required, Validators.maxLength(255)]],
        fieldResult: [this.fieldResult]
      },

      {
        validator: this.labelValidator.bind(this)
      }
    );

    setTimeout(() => {
      this.filterLabelElement.nativeElement.focus();
    }, 0);
  }

  labelValidator(group: AbstractControl): ValidationErrors | null {
    if (
      common.isUndefined(this.filterForm) ||
      common.isUndefined(this.filterForm.controls['label'].value)
    ) {
      return null;
    }

    let label: string = this.filterForm.controls['label'].value.toLowerCase();

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let labels = this.dashboard.extendedFilters
      .filter(z => !!z.field.label)
      .map(x => x.field.label.toLowerCase());

    let ids = this.dashboard.extendedFilters.map(x => x.fieldId.toLowerCase());

    if (labels.indexOf(label) > -1 || ids.indexOf(id) > -1) {
      this.filterForm.controls['label'].setErrors({ labelIsNotUnique: true });
    } else {
      return null;
    }
  }

  resultChange(fieldResult: common.FieldResultEnum) {
    this.fieldResult = fieldResult;
    this.cd.detectChanges();
  }

  save() {
    this.filterForm.markAllAsTouched();

    if (!this.filterForm.valid) {
      return;
    }

    this.ref.close();

    let label: string = this.filterForm.controls['label'].value;

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let result = this.filterForm.controls['fieldResult'].value;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(result)
    };

    let field: common.DashboardField = {
      id: id,
      hidden: false,
      label: label,
      result: result,
      fractions: [fraction],
      description: ''
    };

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.navCreateTempDashboard({
      reports: this.dashboard.reports,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: [...this.dashboard.fields, field]
    });
  }

  cancel() {
    this.ref.close();
  }
}
