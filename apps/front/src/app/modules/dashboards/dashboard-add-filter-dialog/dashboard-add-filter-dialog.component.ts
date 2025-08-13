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
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  FractionSubTypeOption,
  MALLOY_FILTER_ANY,
  SuggestField
} from '~common/_index';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { SelectItem } from '~front/app/interfaces/select-item';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: common.DashboardX;
  apiService: ApiService;
}

export class StoreFilterForItem {
  value: common.StoreFilterForEnum;
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
    //   this.ref.close();
  }

  @ViewChild('filterLabel') filterLabelElement: ElementRef;

  storeModelsSpinnerName = 'dashboardAddStoreModelsSpinnerName';
  storeFiltersSpinnerName = 'dashboardAddStoreFiltersSpinnerName';
  suggestFieldsSpinnerName = 'dashboardAddSuggestFieldsSpinnerName';

  malloyResultsList = constants.RESULTS_LIST;
  storeResultsList: string[] = [];

  modelTypeStore = common.ModelTypeEnum.Store;
  modelTypeMalloy = common.ModelTypeEnum.Malloy;
  storeFilterForFilter = common.StoreFilterForEnum.Filter;
  storeFilterForResult = common.StoreFilterForEnum.Result;
  fieldResultString = common.FieldResultEnum.String;

  fieldResult = common.FieldResultEnum.String;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: common.DashboardX;

  modelTypeForm = this.fb.group({
    modelType: [undefined]
  });

  modelTypesList: SelectItem<common.ModelTypeEnum>[] = [
    {
      label: 'Malloy',
      value: common.ModelTypeEnum.Malloy
    },
    {
      label: 'Store',
      value: common.ModelTypeEnum.Store
    }
  ];

  storeModels: common.Model[] = [];
  storeModelsList: StoreModelItem[] = [];
  storeModelsLoading = false;
  storeModelsLoaded = false;

  storeModelSet = false;
  storeModel: common.Model;

  storeModelForm = this.fb.group({
    storeModel: [undefined]
  });

  storeFilterForForm = this.fb.group({
    storeFilterFor: [undefined]
  });

  storeFilterForList: StoreFilterForItem[] = [
    {
      label: 'Filter',
      value: common.StoreFilterForEnum.Filter
    },
    {
      label: 'Result',
      value: common.StoreFilterForEnum.Result
    }
  ];

  storeFiltersList: StoreFiltersItem[] = [];
  selectedModelLoading = false;
  selectedModelLoaded = false;

  storeFilterForm = this.fb.group({
    storeFilter: [undefined]
  });

  suggestFields: common.SuggestField[] = [];
  suggestFieldsLoading = false;
  suggestFieldsLoaded = false;

  emptySuggestField = Object.assign(
    {},
    common.makeCopy(constants.EMPTY_MCONFIG_FIELD),
    {
      modelFieldRef: undefined,
      topLabel: 'Empty',
      partNodeLabel: undefined,
      partFieldLabel: undefined,
      partLabel: undefined,
      fieldClass: undefined,
      result: undefined
    }
  ) as common.SuggestField;

  labelForm: FormGroup<{
    label: FormControl<string>;
  }>;

  fieldResultForm: FormGroup<{
    fieldResult: FormControl<common.FieldResultEnum>;
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

    this.modelTypeForm.controls['modelType'].setValue(
      common.ModelTypeEnum.Malloy
    );

    setTimeout(() => {
      if (
        this.fieldResult === common.FieldResultEnum.String &&
        this.suggestFieldsLoaded === false
      ) {
        this.loadSuggestFields();
      }
    }, 0);
  }

  labelValidator(group: AbstractControl): ValidationErrors | null {
    if (
      common.isUndefined(this.labelForm) ||
      common.isUndefined(this.labelForm.controls['label'].value)
    ) {
      return null;
    }

    let label: string = this.labelForm.controls['label'].value.toLowerCase();

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

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
      common.ModelTypeEnum.Store
    ) {
      this.storeModelSet = false;

      this.storeModelForm.controls['storeModel'].setValue(undefined);
      this.storeFilterForForm.controls['storeFilterFor'].setValue(
        common.StoreFilterForEnum.Filter
      );
      this.storeFilterForm.controls['storeFilter'].setValue(undefined);
      this.fieldResultForm.controls['fieldResult'].setValue(undefined);
      this.suggestFieldForm.controls['suggestField'].setValue(undefined);

      if (this.storeModelsLoaded === false) {
        this.loadStoreModels();
      }
    } else {
      this.fieldResultForm.controls['fieldResult'].setValue(
        common.FieldResultEnum.String
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
      common.StoreFilterForEnum.Result
    ) {
      if (this.storeResultsList.indexOf(common.FieldResultEnum.String) > -1) {
        this.fieldResultForm.controls['fieldResult'].setValue(
          common.FieldResultEnum.String
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

  resultChange(fieldResult: common.FieldResultEnum) {
    this.formsError = undefined;

    this.fieldResult = fieldResult;

    if (
      this.fieldResult === common.FieldResultEnum.String &&
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

    let payload: apiToBackend.ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.storeModels = resp.payload.models.filter(
              model => model.type === common.ModelTypeEnum.Store
              // model => model.isStoreModel === true
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

    let payload: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: this.storeModelForm.controls['storeModel'].value
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.storeModel = resp.payload.model;

            this.storeFiltersList = resp.payload.model.fields
              .filter(x => x.fieldClass === common.FieldClassEnum.Filter)
              .map(field => {
                let storeFiltersItem: StoreFiltersItem = {
                  value: field.id,
                  label: field.label || field.id
                };

                return storeFiltersItem;
              });

            this.storeResultsList =
              (resp.payload.model.content as common.FileStore).results?.map(
                result => result.result
              ) || [];

            this.selectedModelLoading = false;
            this.selectedModelLoaded = true;
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

    let payload: apiToBackend.ToBackendGetSuggestFieldsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      envId: nav.envId
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.suggestFieldsSpinnerName);

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
      common.ModelTypeEnum.Store
    ) {
      if (
        common.isUndefined(this.storeModelForm.controls['storeModel'].value)
      ) {
        this.formsError = 'Model must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          common.StoreFilterForEnum.Filter &&
        common.isUndefined(this.storeFilterForm.controls['storeFilter'].value)
      ) {
        this.formsError = 'Filter must be selected';
        return;
      }

      if (
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          common.StoreFilterForEnum.Result &&
        common.isUndefined(this.fieldResultForm.controls['fieldResult'].value)
      ) {
        this.formsError = 'Result must be selected';
        return;
      }
    }

    this.formsError = undefined;

    this.ref.close();

    let label: string = this.labelForm.controls['label'].value;

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let fraction: common.Fraction;

    let storeFilter;

    if (
      this.modelTypeForm.controls['modelType'].value ===
      common.ModelTypeEnum.Store
    ) {
      storeFilter =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        common.StoreFilterForEnum.Filter
          ? (this.storeModel.content as common.FileStore).fields.find(
              f => f.name === this.storeFilterForm.controls['storeFilter'].value
            )
          : undefined;

      let storeResultFraction =
        this.storeFilterForForm.controls['storeFilterFor'].value ===
        common.StoreFilterForEnum.Filter
          ? undefined
          : (this.storeModel.content as common.FileStore).results.find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFraction)
        ? undefined
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(storeResultFraction)
        ? []
        : (this.storeModel.content as common.FileStore).results
            .find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            )
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.AndNot,
                value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
            });

      let controls = common.isUndefined(storeResultFraction)
        ? storeFilter.fraction_controls.map(control => {
            let newControl: common.FractionControl = {
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
        : (this.storeModel.content as common.FileStore).results
            .find(
              r =>
                r.result === this.fieldResultForm.controls['fieldResult'].value
            )
            .fraction_types[0].controls.map(control => {
              let newControl: common.FractionControl = {
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
        operator: common.isUndefined(logicGroup)
          ? undefined
          : logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: this.fieldResultForm.controls['fieldResult'].value,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFraction?.type,
        storeFractionSubTypeLabel: common.isDefined(storeResultFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFraction?.type
            ).label
          : storeResultFraction?.type,
        storeFractionLogicGroupWithSubType:
          common.isDefined(logicGroup) &&
          common.isDefined(storeResultFraction?.type)
            ? `${logicGroup}${common.TRIPLE_UNDERSCORE}${storeResultFraction.type}`
            : undefined,
        controls: controls
      };
    } else if (
      this.modelTypeForm.controls['modelType'].value ===
      common.ModelTypeEnum.Malloy
    ) {
      fraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(
          this.fieldResultForm.controls['fieldResult'].value
        )
      };
    } else {
      fraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(
          this.fieldResultForm.controls['fieldResult'].value
        )
      };
    }

    let suggestField = this.suggestFieldForm.controls['suggestField'].value;

    let field: common.DashboardField = {
      id: id,
      hidden: false,
      label: label,
      maxFractions: common.isDefined(storeFilter)
        ? Number(storeFilter.max_fractions)
        : undefined,
      storeModel:
        this.modelTypeForm.controls['modelType'].value ===
        common.ModelTypeEnum.Store
          ? this.storeModelForm.controls['storeModel'].value
          : undefined,
      storeFilter:
        this.modelTypeForm.controls['modelType'].value ===
          common.ModelTypeEnum.Store &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          common.StoreFilterForEnum.Filter
          ? this.storeFilterForm.controls['storeFilter'].value
          : undefined,
      storeResult:
        this.modelTypeForm.controls['modelType'].value ===
          common.ModelTypeEnum.Store &&
        this.storeFilterForForm.controls['storeFilterFor'].value ===
          common.StoreFilterForEnum.Result
          ? this.fieldResultForm.controls['fieldResult'].value
          : undefined,
      result:
        this.modelTypeForm.controls['modelType'].value ===
        common.ModelTypeEnum.Malloy
          ? this.fieldResultForm.controls['fieldResult'].value
          : undefined,
      suggestModelDimension: common.isDefined(suggestField?.modelFieldRef)
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
      newDashboardId: common.makeId(),
      newDashboardFields: [...this.dashboard.fields, field],
      timezone: this.uiQuery.getValue().timezone
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
