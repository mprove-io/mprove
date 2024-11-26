import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SuggestField } from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class DashboardAddFilterDialogComponent implements OnInit {
  filterForm: FormGroup;

  spinnerName = 'dashboardAddSuggestSpinnerName';

  // @HostListener('window:keyup.esc')
  // onEscKeyUp() {
  //   this.ref.close();
  // }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  resultList = constants.RESULT_LIST;

  fieldResult = common.FieldResultEnum.String;

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
    private spinner: NgxSpinnerService,
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
        fieldResult: [this.fieldResult],
        suggestFieldRef: [undefined]
      },
      {
        validator: this.labelValidator.bind(this)
      }
    );

    setTimeout(() => {
      this.filterLabelElement.nativeElement.focus();
      this.loadSuggestFields();
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

    this.loadSuggestFields();
    this.cd.detectChanges();
  }

  loadSuggestFields() {
    if (
      this.fieldResult === common.FieldResultEnum.String &&
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

      this.spinner.show(this.spinnerName);

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

              this.spinner.hide(this.spinnerName);

              this.cd.detectChanges();
            }
          })
        )
        .toPromise();
    }
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
      suggestModelDimension: this.filterForm.controls['suggestFieldRef'].value,
      fractions: [fraction],
      description: undefined
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

  searchFn(term: string, suggestField: SuggestField) {
    let haystack = [
      `${suggestField.topLabel} ${suggestField.partNodeLabel} ${suggestField.partFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
