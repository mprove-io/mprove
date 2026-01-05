import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
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
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '~common/constants/top';
import { EMPTY_MCONFIG_FIELD, RESULTS_LIST } from '~common/constants/top-front';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { StoreFilterForEnum } from '~common/enums/store-filter-for.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { SuggestField } from '~common/interfaces/backend/suggest-field';
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { Model } from '~common/interfaces/blockml/model';
import { SelectItem } from '~common/interfaces/front/select-item';
import {
  ToBackendGetModelRequestPayload,
  ToBackendGetModelResponse
} from '~common/interfaces/to-backend/models/to-backend-get-model';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '~common/interfaces/to-backend/models/to-backend-get-models';
import {
  ToBackendGetSuggestFieldsRequestPayload,
  ToBackendGetSuggestFieldsResponse
} from '~common/interfaces/to-backend/suggest-fields/to-backend-get-suggest-fields';
import { MyRegex } from '~common/models/my-regex';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { SharedModule } from '../../shared/shared.module';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: DashboardX;
  apiService: ApiService;
}

export class StoreFilterForItem {
  value: StoreFilterForEnum;
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

  modelTypeStore = ModelTypeEnum.Store;
  modelTypeMalloy = ModelTypeEnum.Malloy;
  storeFilterForFilter = StoreFilterForEnum.Filter;
  storeFilterForResult = StoreFilterForEnum.Result;
  fieldResultString = FieldResultEnum.String;

  fieldResult = FieldResultEnum.String;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: DashboardX;

  modelTypeForm = this.fb.group({
    modelType: [undefined]
  });

  modelTypesList: SelectItem<ModelTypeEnum>[] = [
    {
      label: 'Malloy',
      value: ModelTypeEnum.Malloy
    },
    {
      label: 'Store',
      value: ModelTypeEnum.Store
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

  storeFilterForForm = this.fb.group({
    storeFilterFor: [undefined]
  });

  storeFilterForList: StoreFilterForItem[] = [
    {
      label: 'Filter',
      value: StoreFilterForEnum.Filter
    },
    {
      label: 'Result',
      value: StoreFilterForEnum.Result
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
    fieldResult: FormControl<FieldResultEnum>;
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

    this.modelTypeForm.controls['modelType'].setValue(ModelTypeEnum.Malloy);

    setTimeout(() => {
      if (
        this.fieldResult === FieldResultEnum.String &&
        this.suggestFieldsLoaded === false
      ) {
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
      this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Store
    ) {
      this.storeModelSet = false;

      this.storeModelForm.controls['storeModel'].setValue(undefined);
      this.storeFilterForForm.controls['storeFilterFor'].setValue(
        StoreFilterForEnum.Filter
      );
      this.storeFilterForm.controls['storeFilter'].setValue(undefined);
      this.fieldResultForm.controls['fieldResult'].setValue(undefined);
      this.suggestFieldForm.controls['suggestField'].setValue(undefined);

      if (this.storeModelsLoaded === false) {
        this.loadStoreModels();
      }
    } else {
      this.fieldResultForm.controls['fieldResult'].setValue(
        FieldResultEnum.String
      );
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
      StoreFilterForEnum.Result
    ) {
      if (this.storeResultsList.indexOf(FieldResultEnum.String) > -1) {
        this.fieldResultForm.controls['fieldResult'].setValue(
          FieldResultEnum.String
        );
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

  resultChange(fieldResult: FieldResultEnum) {
    this.formsError = undefined;

    this.fieldResult = fieldResult;

    if (
      this.fieldResult === FieldResultEnum.String &&
      this.suggestFieldsLoaded === false
    ) {
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

    let payload: ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.storeModels = resp.payload.models.filter(
              model => model.type === ModelTypeEnum.Store
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

    let payload: ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: this.storeModelForm.controls['storeModel'].value
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.storeModel = resp.payload.model;

            this.storeFiltersList = resp.payload.model.fields
              .filter(x => x.fieldClass === FieldClassEnum.Filter)
              .map(field => {
                let storeFiltersItem: StoreFiltersItem = {
                  value: field.id,
                  label: field.label || field.id
                };

                return storeFiltersItem;
              });

            this.storeResultsList =
              resp.payload.model.storeContent.results?.map(
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

    let payload: ToBackendGetSuggestFieldsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      envId: nav.envId,
      parentId: this.dashboard.dashboardId,
      parentType: MconfigParentTypeEnum.Dashboard
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.suggestFieldsSpinnerName);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetSuggestFieldsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.suggestFields = [
              this.emptySuggestField,
              ...resp.payload.suggestFields
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
      this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Store
    ) {
      if (isUndefined(this.storeModelForm.controls['storeModel'].value)) {
        this.formsError = 'Model must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          StoreFilterForEnum.Filter &&
        isUndefined(this.storeFilterForm.controls['storeFilter'].value)
      ) {
        this.formsError = 'Filter must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          StoreFilterForEnum.Result &&
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
      this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Store
    ) {
      storeFilter =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        StoreFilterForEnum.Filter
          ? this.storeModel.storeContent.fields.find(
              f => f.name === this.storeFilterForm.controls['storeFilter'].value
            )
          : undefined;

      let storeResultFraction =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        StoreFilterForEnum.Filter
          ? undefined
          : this.storeModel.storeContent.results.find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            ).fraction_types[0];

      let logicGroup = isUndefined(storeResultFraction)
        ? undefined
        : FractionLogicEnum.Or;

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
                logicGroup: FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.AndNot,
                value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
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
          : logicGroup === FractionLogicEnum.Or
            ? FractionOperatorEnum.Or
            : FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: FractionTypeEnum.StoreFraction,
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
      this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Malloy
    ) {
      fraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(
          this.fieldResultForm.controls['fieldResult'].value
        )
      };
    } else {
      fraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(
          this.fieldResultForm.controls['fieldResult'].value
        )
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
        this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Store
          ? this.storeModelForm.controls['storeModel'].value
          : undefined,
      storeFilter:
        this.modelTypeForm.controls['modelType'].value ===
          ModelTypeEnum.Store &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          StoreFilterForEnum.Filter
          ? this.storeFilterForm.controls['storeFilter'].value
          : undefined,
      storeResult:
        this.modelTypeForm.controls['modelType'].value ===
          ModelTypeEnum.Store &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          StoreFilterForEnum.Result
          ? this.fieldResultForm.controls['fieldResult'].value
          : undefined,
      result:
        this.modelTypeForm.controls['modelType'].value === ModelTypeEnum.Malloy
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
