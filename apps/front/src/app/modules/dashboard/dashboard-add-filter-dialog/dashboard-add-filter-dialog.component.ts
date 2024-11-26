import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: common.DashboardX;
  apiService: ApiService;
}

@Component({
  selector: 'm-dashboard-add-filter-dialog',
  templateUrl: './dashboard-add-filter-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, SharedModule]
})
export class DashboardAddFilterDialogComponent implements OnInit {
  filterForm: FormGroup;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  resultList = constants.RESULT_LIST;

  fieldResult = common.FieldResultEnum.Number;

  fieldResultString = common.FieldResultEnum.String;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: common.DashboardX;

  suggestFields: common.SuggestField[] = [];

  suggestFieldsLoading: boolean;
  suggestFieldsLoaded = false;

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
      .filter(y => !!y.field.label)
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

    if (
      fieldResult === common.FieldResultEnum.String &&
      this.suggestFieldsLoaded === false
    ) {
      this.suggestFieldsLoading = true;

      let nav: NavState;
      this.navQuery
        .select()
        .pipe(
          tap(x => {
            nav = x;
          }),
          take(1)
        )
        .subscribe();

      let payload: apiToBackend.ToBackendGetSuggestFieldsRequestPayload = {
        projectId: nav.projectId,
        branchId: nav.branchId,
        isRepoProd: nav.isRepoProd,
        envId: nav.envId
      };

      let apiService: ApiService = this.ref.data.apiService;

      // this.spinner.show(this.spinnerName);

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields,
          payload: payload
        })
        .pipe(
          tap((resp: apiToBackend.ToBackendGetSuggestFieldsResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.suggestFields = resp.payload.suggestFields;

              this.suggestFieldsLoading = false;
              this.suggestFieldsLoaded = true;

              // this.spinner.hide(this.spinnerName);

              this.cd.detectChanges();
            }
          })
        )
        .toPromise();
    }

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
      suggestModelDimension: undefined,
      fractions: [fraction],
      description: ''
    };

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: [...this.dashboard.fields, field],
      deleteFilterFieldId: undefined,
      deleteFilterMconfigId: undefined
    });
  }

  cancel() {
    this.ref.close();
  }
}
