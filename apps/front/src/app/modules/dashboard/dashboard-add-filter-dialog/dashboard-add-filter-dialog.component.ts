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
import { DashboardService } from '~front/app/services/dashboard.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { ModelsQuery } from '~front/app/queries/models.query';
import { UiQuery } from '~front/app/queries/ui.query';

export interface DashboardAddFilterDialogData {
  dashboardService: DashboardService;
  dashboard: common.DashboardX;
  apiService: ApiService;
}

export class ModelTypeItem {
  value: common.ModelTypeEnum;
  label: string;
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

  storeModelsSpinnerName = 'dashboardAddstoreModelsSpinnerName';
  storeFiltersSpinnerName = 'dashboardAddstoreFiltersSpinnerName';
  suggestFieldsSpinnerName = 'dashboardAddSuggestFieldsSpinnerName';

  sqlResultsList = constants.RESULTS_LIST;
  storeResultsList: string[] = [];

  fieldResult = common.FieldResultEnum.String;

  fieldResultString = common.FieldResultEnum.String;

  modelTypeStore = common.ModelTypeEnum.Store;
  modelTypeSql = common.ModelTypeEnum.SQL;

  storeFilterForFilter = common.StoreFilterForEnum.Filter;
  storeFilterForResult = common.StoreFilterForEnum.Result;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  dashboard: common.DashboardX;

  modelTypeForm = this.fb.group({
    modelType: [
      {
        value: undefined
      }
    ]
  });

  modelTypesList: ModelTypeItem[] = [
    {
      label: 'SQL',
      value: common.ModelTypeEnum.SQL
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

  storeModelForm = this.fb.group({
    storeModel: [
      {
        value: undefined
      }
    ]
  });

  storeFilterForForm = this.fb.group({
    storeFilterFor: [
      {
        value: undefined
      }
    ]
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
  storeFiltersLoading = false;
  storeFiltersLoaded = false;

  storeFilterForm = this.fb.group({
    storeFilter: [
      {
        value: undefined
      }
    ]
  });

  suggestFields: common.SuggestField[] = [];
  suggestFieldsLoading = false;
  suggestFieldsLoaded = false;

  emptySuggestField = Object.assign({}, constants.EMPTY_MCONFIG_FIELD, {
    modelFieldRef: undefined,
    topLabel: 'Empty',
    partNodeLabel: undefined,
    partFieldLabel: undefined
  } as common.SuggestField);

  topForm: FormGroup<{
    label: FormControl<string>;
    fieldResult: FormControl<common.FieldResultEnum>;
    suggestField: FormControl<SuggestField>;
  }>;

  constructor(
    public ref: DialogRef<DashboardAddFilterDialogData>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private modelsQuery: ModelsQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard;

    this.modelTypeForm.controls['modelType'].setValue(common.ModelTypeEnum.SQL);

    this.topForm = this.fb.group(
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
      common.isUndefined(this.topForm) ||
      common.isUndefined(this.topForm.controls['label'].value)
    ) {
      return null;
    }

    let label: string = this.topForm.controls['label'].value.toLowerCase();

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let labels = this.dashboard.extendedFilters
      .filter(y => !!y.field.label)
      .map(x => x.field.label.toLowerCase());

    let ids = this.dashboard.extendedFilters.map(x => x.fieldId.toLowerCase());

    if (labels.indexOf(label) > -1 || ids.indexOf(id) > -1) {
      this.topForm.controls['label'].setErrors({ labelIsNotUnique: true });
    } else {
      return null;
    }
  }

  modelTypeChange() {
    (document.activeElement as HTMLElement).blur();

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
      this.topForm.controls['fieldResult'].setValue(undefined);

      if (this.storeModelsLoaded === false) {
        this.loadStoreModels();
      }
    } else {
      this.topForm.controls['fieldResult'].setValue(
        common.FieldResultEnum.String
      );
    }
  }

  storeModelChange() {
    (document.activeElement as HTMLElement).blur();

    this.storeModelSet = true;

    this.storeFiltersLoaded = false;
    this.loadStoreFilters();

    this.cd.detectChanges();
  }

  storeFilterForChange() {
    (document.activeElement as HTMLElement).blur();

    if (
      this.storeFilterForForm.controls['storeFilterFor'].value ===
      common.StoreFilterForEnum.Result
    ) {
      if (this.storeResultsList.indexOf(common.FieldResultEnum.String) > -1) {
        this.topForm.controls['fieldResult'].setValue(
          common.FieldResultEnum.String
        );
      } else {
        this.topForm.controls['fieldResult'].setValue(undefined);
      }
    } else {
      this.topForm.controls['fieldResult'].setValue(undefined);
    }
  }

  storeFilterChange() {
    (document.activeElement as HTMLElement).blur();
  }

  resultChange(fieldResult: common.FieldResultEnum) {
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
              model => model.isStoreModel === true
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

  loadStoreFilters() {
    this.storeFiltersLoading = true;

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

            this.storeFiltersLoading = false;
            this.storeFiltersLoaded = true;
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
    this.topForm.markAllAsTouched();

    if (!this.topForm.valid) {
      return;
    }

    this.ref.close();

    let label: string = this.topForm.controls['label'].value;

    let id = common.MyRegex.replaceSpacesWithUnderscores(label).toLowerCase();

    let result = this.topForm.controls['fieldResult'].value;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(result)
    };

    let suggestField = this.topForm.controls['suggestField'].value;

    let field: common.DashboardField = {
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

    let dashboardService: DashboardService = this.ref.data.dashboardService;

    dashboardService.navCreateTempDashboard({
      tiles: this.dashboard.tiles,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: [...this.dashboard.fields, field],
      deleteFilterFieldId: undefined,
      deleteFilterTileTitle: undefined,
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
