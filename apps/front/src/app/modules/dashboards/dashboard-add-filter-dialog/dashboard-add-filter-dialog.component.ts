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
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { EMPTY_MCONFIG_FIELD, RESULTS_LIST } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { SuggestField } from '#common/types/backend/parts/suggest-field';
import type { ToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import type { ToBackendGetModelResponse } from '#common/types/backend/routes/models/get-model/get-model-response';
import type { ToBackendGetModelsRequest } from '#common/types/backend/routes/models/get-models/get-models-request';
import type { ToBackendGetModelsResponse } from '#common/types/backend/routes/models/get-models/get-models-response';
import type { ToBackendGetSuggestFieldsRequest } from '#common/types/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-request';
import type { ToBackendGetSuggestFieldsResponse } from '#common/types/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-response';
import type { DashboardField } from '#common/types/blockml/parts/dashboard/dashboard-field';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';
import type { StoreFilterFor } from '#common/types/blockml/parts/store/store-filter-for';
import type { SelectItem } from '#common/types/front/ui/select-item';
import { getFractionTypeForAny } from '#front/app/functions/get-fraction-type-for-any';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { DashboardService } from '#front/app/services/dashboard.service';
import { SharedModule } from '../../shared/shared.module';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: DashboardX;
  apiService: ApiService;
}

export class StoreFilterForItem {
  value: StoreFilterFor;
  label: string;
}

export class StoreModelItem {
  value: string;
  label: string;
}

export class StoreFiltersItem {
  value: string;
  label: string;
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
  @ViewChild('typeSelect', { static: false })
  typeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.typeSelectElement?.close();
  }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  storeModelsSpinnerName = 'dashboardAddStoreModelsSpinnerName';
  storeFiltersSpinnerName = 'dashboardAddStoreFiltersSpinnerName';
  suggestFieldsSpinnerName = 'dashboardAddSuggestFieldsSpinnerName';

  malloyResultsList = RESULTS_LIST;
  storeResultsList: string[] = [];

  fieldResult: FieldResult = 'string';

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: DashboardX;

  modelTypeForm: FormGroup<{
    modelType: FormControl<ModelType>;
  }> = this.fb.group({
    modelType: this.fb.control<ModelType>(undefined)
  });

  modelTypesList: SelectItem<ModelType>[] = [
    {
      label: 'Malloy',
      value: 'Malloy'
    },
    {
      label: 'Store',
      value: 'Store'
    }
  ];

  storeModels: Model[] = [];
  storeModelsList: StoreModelItem[] = [];
  storeModelsLoading = false;
  storeModelsLoaded = false;

  storeModelSet = false;
  storeModel: Model;

  storeModelForm = this.fb.group({
    storeModel: [undefined]
  });

  storeFilterForForm: FormGroup<{
    storeFilterFor: FormControl<StoreFilterFor>;
  }> = this.fb.group({
    storeFilterFor: this.fb.control<StoreFilterFor>(undefined)
  });

  storeFilterForList: StoreFilterForItem[] = [
    {
      label: 'Filter',
      value: 'Filter'
    },
    {
      label: 'Result',
      value: 'Result'
    }
  ];

  storeFiltersList: StoreFiltersItem[] = [];
  selectedModelLoading = false;
  selectedModelLoaded = false;

  storeFilterForm = this.fb.group({
    storeFilter: [undefined]
  });

  suggestFields: SuggestField[] = [];
  suggestFieldsLoading = false;
  suggestFieldsLoaded = false;

  emptySuggestField = Object.assign({}, makeCopy(EMPTY_MCONFIG_FIELD), {
    modelFieldRef: undefined,
    connectionType: undefined,
    topLabel: 'Empty',
    partNodeLabel: undefined,
    partFieldLabel: undefined,
    partLabel: undefined,
    fieldClass: undefined,
    result: undefined
  }) as SuggestField;

  labelForm: FormGroup<{
    label: FormControl<string>;
  }>;

  fieldResultForm: FormGroup<{
    fieldResult: FormControl<FieldResult>;
  }>;

  suggestFieldForm: FormGroup<{
    suggestField: FormControl<SuggestField>;
  }>;

  formsError: string;

  constructor(
    public ref: DialogRef<DashboardAddFilterDialogData>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard;

    this.labelForm = this.fb.group(
      {
        label: [undefined, [Validators.required, Validators.maxLength(255)]]
      },
      {
        validator: this.labelValidator.bind(this)
      }
    );

    this.fieldResultForm = this.fb.group({
      fieldResult: [this.fieldResult]
    });

    this.suggestFieldForm = this.fb.group({
      suggestField: [this.emptySuggestField]
    });

    this.modelTypeForm.controls['modelType'].setValue('Malloy');

    setTimeout(() => {
      if (this.fieldResult === 'string' && this.suggestFieldsLoaded === false) {
        this.loadSuggestFields();
      }
    }, 0);
  }

  labelValidator(group: AbstractControl): ValidationErrors | null {
    if (
      isUndefined(this.labelForm) ||
      isUndefined(this.labelForm.controls['label'].value)
    ) {
      return null;
    }

    let label: string = this.labelForm.controls['label'].value.toLowerCase();

    let id = MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let labels = this.dashboard.extendedFilters
      .filter(y => !!y.field.label)
      .map(x => x.field.label.toLowerCase());

    let ids = this.dashboard.extendedFilters.map(x => x.fieldId.toLowerCase());

    if (labels.indexOf(label) > -1 || ids.indexOf(id) > -1) {
      this.labelForm.controls['label'].setErrors({ labelIsNotUnique: true });
    } else {
      return null;
    }
  }

  modelTypeChange() {
    (document.activeElement as HTMLElement).blur();

    this.formsError = undefined;

    if (
      this.modelTypeForm.controls['modelType'].value ===
      ('Store' satisfies ModelType)
    ) {
      this.storeModelSet = false;

      this.storeModelForm.controls['storeModel'].setValue(undefined);

      this.storeFilterForForm.controls['storeFilterFor'].setValue('Filter');

      this.storeFilterForm.controls['storeFilter'].setValue(undefined);
      this.fieldResultForm.controls['fieldResult'].setValue(undefined);
      this.suggestFieldForm.controls['suggestField'].setValue(undefined);

      if (this.storeModelsLoaded === false) {
        this.loadStoreModels();
      }
    } else {
      this.fieldResultForm.controls['fieldResult'].setValue('string');
    }
  }

  storeModelChange() {
    (document.activeElement as HTMLElement).blur();

    this.formsError = undefined;

    this.storeModelSet = true;

    this.selectedModelLoaded = false;
    this.loadSelectedModel();

    this.cd.detectChanges();
  }

  storeFilterForChange() {
    (document.activeElement as HTMLElement).blur();

    this.formsError = undefined;

    if (
      this.storeFilterForForm.controls['storeFilterFor'].value ===
      ('Result' satisfies StoreFilterFor)
    ) {
      if (this.storeResultsList.includes('string' satisfies FieldResult)) {
        this.fieldResultForm.controls['fieldResult'].setValue('string');
      } else {
        this.fieldResultForm.controls['fieldResult'].setValue(undefined);
      }
    } else {
      this.fieldResultForm.controls['fieldResult'].setValue(undefined);
    }
  }

  storeFilterChange() {
    (document.activeElement as HTMLElement).blur();

    this.formsError = undefined;
  }

  resultChange(fieldResult: FieldResult) {
    this.formsError = undefined;

    this.fieldResult = fieldResult;

    if (this.fieldResult === 'string' && this.suggestFieldsLoaded === false) {
      this.loadSuggestFields();
    }
    this.cd.detectChanges();
  }

  loadStoreModels() {
    this.storeModelsLoading = true;

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

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.storeModelsSpinnerName);

    let payload: ToBackendGetModelsRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId
    };

    apiService
      .req({
        route: 'api/ToBackendGetModels',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp?.type === 'Success') {
            this.storeModels = resp.output.models.filter(
              model => model.type === 'Store'
            );

            this.storeModelsList = this.storeModels.map(model => {
              let storeModelItem: StoreModelItem = {
                value: model.modelId,
                label: model.label || model.modelId
              };

              return storeModelItem;
            });

            this.storeModelsLoading = false;
            this.storeModelsLoaded = true;

            this.spinner.hide(this.storeModelsSpinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  loadSelectedModel() {
    this.selectedModelLoading = true;

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

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.storeFiltersSpinnerName);

    let payload: ToBackendGetModelRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: this.storeModelForm.controls['storeModel'].value,
      getMalloy: false
    };

    apiService
      .req({
        route: 'api/ToBackendGetModel',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelResponse) => {
          if (resp?.type === 'Success') {
            this.storeModel = resp.output.model;

            this.storeFiltersList = resp.output.model.fields
              .filter(x => x.fieldClass === 'filter')
              .map(field => {
                let storeFiltersItem: StoreFiltersItem = {
                  value: field.id,
                  label: field.label || field.id
                };

                return storeFiltersItem;
              });

            this.storeResultsList =
              resp.output.model.storeContent.results?.map(
                result => result.result
              ) || [];

            this.selectedModelLoading = false;
            this.selectedModelLoaded = true;

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  loadSuggestFields() {
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

    let payload: ToBackendGetSuggestFieldsRequest['input'] = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      repoId: nav.repoId,
      envId: nav.envId,
      parentId: this.dashboard.dashboardId,
      parentType: 'Dashboard'
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.suggestFieldsSpinnerName);

    apiService
      .req({
        route: 'api/ToBackendGetSuggestFields',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetSuggestFieldsResponse) => {
          if (resp?.type === 'Success') {
            this.suggestFields = [
              this.emptySuggestField,
              ...resp.output.suggestFields
            ];

            this.suggestFieldsLoading = false;
            this.suggestFieldsLoaded = true;

            this.spinner.hide(this.suggestFieldsSpinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  save() {
    this.labelForm.markAllAsTouched();

    if (!this.labelForm.valid) {
      return;
    }

    if (
      this.modelTypeForm.controls['modelType'].value ===
      ('Store' satisfies ModelType)
    ) {
      if (isUndefined(this.storeModelForm.controls['storeModel'].value)) {
        this.formsError = 'Model must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          ('Filter' satisfies StoreFilterFor) &&
        isUndefined(this.storeFilterForm.controls['storeFilter'].value)
      ) {
        this.formsError = 'Filter must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          ('Result' satisfies StoreFilterFor) &&
        isUndefined(this.fieldResultForm.controls['fieldResult'].value)
      ) {
        this.formsError = 'Result must be selected';
        return;
      }
    }

    this.formsError = undefined;

    this.ref.close();

    let label: string = this.labelForm.controls['label'].value;

    let id = MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let fraction: Fraction;

    let storeFilter;

    if (
      this.modelTypeForm.controls['modelType'].value ===
      ('Store' satisfies ModelType)
    ) {
      storeFilter =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        ('Filter' satisfies StoreFilterFor)
          ? this.storeModel.storeContent.fields.find(
              f => f.name === this.storeFilterForm.controls['storeFilter'].value
            )
          : undefined;

      let storeResultFraction =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        ('Filter' satisfies StoreFilterFor)
          ? undefined
          : this.storeModel.storeContent.results.find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            ).fraction_types[0];

      let logicGroup: FractionLogic = isUndefined(storeResultFraction)
        ? undefined
        : 'OR';

      let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
        ? []
        : this.storeModel.storeContent.results
            .find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            )
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: 'OR',
                typeValue: ft.type,
                value: `${'OR' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: 'AND_NOT',
                value: `${'AND_NOT' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === 'OR' ? -1 : 1;
            });

      let controls = isUndefined(storeResultFraction)
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
        : this.storeModel.storeContent.results
            .find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            )
            .fraction_types[0].controls.map(control => {
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
            });

      fraction = {
        meta: storeResultFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === 'OR'
            ? 'Or'
            : 'And',
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: 'StoreFraction',
        storeResult: this.fieldResultForm.controls['fieldResult'].value,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFraction?.type,
        storeFractionSubTypeLabel: isDefined(storeResultFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFraction?.type
            ).label
          : storeResultFraction?.type,
        storeFractionLogicGroupWithSubType:
          isDefined(logicGroup) && isDefined(storeResultFraction?.type)
            ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFraction.type}`
            : undefined,
        controls: controls
      };
    } else if (
      this.modelTypeForm.controls['modelType'].value ===
      ('Malloy' satisfies ModelType)
    ) {
      fraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: 'Or',
        type: getFractionTypeForAny({
          result: this.fieldResultForm.controls['fieldResult'].value
        })
      };
    } else {
      fraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: 'Or',
        type: getFractionTypeForAny({
          result: this.fieldResultForm.controls['fieldResult'].value
        })
      };
    }

    let suggestField = this.suggestFieldForm.controls['suggestField'].value;

    let field: DashboardField = {
      id: id,
      hidden: false,
      label: label,
      maxFractions: isDefined(storeFilter)
        ? Number(storeFilter.max_fractions)
        : undefined,
      storeModel:
        this.modelTypeForm.controls['modelType'].value ===
        ('Store' satisfies ModelType)
          ? this.storeModelForm.controls['storeModel'].value
          : undefined,
      storeFilter:
        this.modelTypeForm.controls['modelType'].value ===
          ('Store' satisfies ModelType) &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          ('Filter' satisfies StoreFilterFor)
          ? this.storeFilterForm.controls['storeFilter'].value
          : undefined,
      storeResult:
        this.modelTypeForm.controls['modelType'].value ===
          ('Store' satisfies ModelType) &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          ('Result' satisfies StoreFilterFor)
          ? this.fieldResultForm.controls['fieldResult'].value
          : undefined,
      result:
        this.modelTypeForm.controls['modelType'].value ===
        ('Malloy' satisfies ModelType)
          ? this.fieldResultForm.controls['fieldResult'].value
          : undefined,
      suggestModelDimension: isDefined(suggestField?.modelFieldRef)
        ? suggestField?.modelFieldRef
        : undefined,
      fractions: [fraction],
      description: undefined
    };

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.editDashboard({
      isDraft: this.dashboard.draft,
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: makeId(),
      newDashboardFields: [...this.dashboard.fields, field],
      timezone: this.uiQuery.getValue().timezone,
      isQueryCache: false,
      cachedQueryMconfigIds: []
    });
  }

  suggestFieldChange() {
    (document.activeElement as HTMLElement).blur();
  }

  searchFn(term: string, suggestField: SuggestField) {
    let haystack = [
      `${suggestField.topLabel} - ${suggestField.partNodeLabel} ${suggestField.partFieldLabel} ${suggestField.connectionType}`
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
