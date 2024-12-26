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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SuggestField } from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportService } from '~front/app/services/report.service';

export interface ReportAddFilterDialogData {
  reportService: ReportService;
  report: common.ReportX;
  apiService: ApiService;
}

@Component({
  selector: 'm-report-add-filter-dialog',
  templateUrl: './report-add-filter-dialog.component.html',
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
export class ReportAddFilterDialogComponent implements OnInit {
  @ViewChild('typeSelect', { static: false })
  typeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.typeSelectElement?.close();
    //   this.ref.close();
  }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  spinnerName = 'reportAddSuggestSpinnerName';

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

  report: common.ReportX;

  suggestFields: common.SuggestField[] = [];

  suggestFieldsLoading: boolean;
  suggestFieldsLoaded = false;

  emptySuggestField = Object.assign({}, constants.EMPTY_MCONFIG_FIELD, {
    modelFieldRef: undefined,
    topLabel: 'Empty',
    partNodeLabel: undefined,
    partFieldLabel: undefined
  } as common.SuggestField);

  filterForm: FormGroup<{
    label: FormControl<string>;
    fieldResult: FormControl<common.FieldResultEnum>;
    suggestField: FormControl<SuggestField>;
  }>;

  constructor(
    public ref: DialogRef<ReportAddFilterDialogData>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private reportQuery: ReportQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.report = this.ref.data.report;

    // setValueAndMark({
    //   control: this.labelForm.controls['label'],
    //   value: ''
    // });

    this.filterForm = this.fb.group(
      {
        label: [undefined, [Validators.required, Validators.maxLength(255)]],
        fieldResult: [this.fieldResult],
        suggestField: [this.emptySuggestField]
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

    let labels = this.report.extendedFilters
      .filter(y => !!y.field.label)
      .map(x => x.field.label.toLowerCase());

    let ids = this.report.extendedFilters.map(x => x.fieldId.toLowerCase());

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
              this.suggestFields = [
                this.emptySuggestField,
                ...resp.payload.suggestFields
              ];

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

    let id =
      common.MyRegex.replaceNonLettersNumbersWithUnderscores(
        label
      ).toLowerCase();

    let result = this.filterForm.controls['fieldResult'].value;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(result)
    };

    let suggestField = this.filterForm.controls['suggestField'].value;

    let field: common.ReportField = {
      id: id,
      hidden: false,
      label: label,
      result: result,
      suggestModelDimension: common.isDefined(suggestField.modelFieldRef)
        ? suggestField.modelFieldRef
        : undefined,
      fractions: [fraction],
      description: undefined
    };

    let globalRow = this.reportQuery
      .getValue()
      .rows.find(row => row.rowId === common.GLOBAL_ROW_ID);

    let newParameters = common.isDefined(globalRow.parameters)
      ? [...globalRow.parameters]
      : [];

    let newParameter: common.Parameter = {
      parameterId: [globalRow.rowId, field.id].join('_').toUpperCase(),
      parameterType: common.ParameterTypeEnum.Field,
      filter: field.id,
      result: result,
      formula: undefined,
      xDeps: undefined,
      conditions: ['any']
    };

    newParameters = [...newParameters, newParameter];

    let rowChange: common.RowChange = {
      rowId: common.GLOBAL_ROW_ID,
      parameters: newParameters
    };

    let reportService: ReportService = this.ref.data.reportService;

    reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: [...this.report.fields, field]
    });
  }

  suggestFieldChange() {
    (document.activeElement as HTMLElement).blur();
  }

  searchFn(term: string, suggestField: SuggestField) {
    let haystack = [
      `${suggestField.topLabel} - ${suggestField.partNodeLabel} ${suggestField.partFieldLabel}`
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
