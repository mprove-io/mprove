import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerModule } from 'ngx-spinner';
import { take, tap } from 'rxjs';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import type { ToBackendGetModelResponse } from '#common/types/backend/routes/models/get-model/get-model-response';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelFieldY } from '#common/types/blockml/parts/model/model-field-y';
import type { Parameter } from '#common/types/blockml/parts/report/row/parameter';
import type { RowChange } from '#common/types/blockml/parts/report/row/row-change';
import type { DataRow } from '#common/types/front/report/row/data-row';
import type { Timeframe } from '#common/types/shared/time/timeframe';
import { getFractionTypeForAny } from '#front/app/functions/get-fraction-type-for-any';
import { NavQuery } from '#front/app/queries/nav.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { ReportService } from '#front/app/services/report.service';
import { SharedModule } from '../../shared/shared.module';

export interface RowAddFilterDialogData {
  apiService: ApiService;
  reportSelectedNode: IRowNode<DataRow>;
}

@Component({
  selector: 'm-row-add-filter-dialog',
  templateUrl: './row-add-filter-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TippyDirective,
    NgxSpinnerModule
  ]
})
export class RowAddFilterDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  modelLoading = false;
  model: Model;

  sortedFieldsY: ModelFieldY[];

  addFilterForm: FormGroup<{
    field: FormControl<string>;
  }>;

  isFieldAlreadyFiltered = false;
  newFieldId: string;

  constructor(
    public ref: DialogRef<RowAddFilterDialogData>,
    private fb: FormBuilder,
    private structQuery: StructQuery,
    private reportService: ReportService,
    private reportQuery: ReportQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addFilterForm = this.fb.group({
      field: this.fb.control<string>(undefined)
    });

    this.loadModel();
  }

  loadModel() {
    this.modelLoading = true;

    let metric = this.structQuery
      .getValue()
      .metrics.find(
        y => y.metricId === this.ref.data.reportSelectedNode.data.metricId
      );

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetModelRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: metric.modelId,
      getMalloy: false
    };

    this.apiService
      .req({
        route: 'api/ToBackendGetModel',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelResponse) => {
          if (resp.type === 'Success') {
            let restrictedFilterFieldIds =
              metric.modelType === 'Malloy'
                ? [
                    `${metric.timeFieldId}_year`,
                    `${metric.timeFieldId}_quarter`,
                    `${metric.timeFieldId}_month`,
                    `${metric.timeFieldId}_week`,
                    `${metric.timeFieldId}_day`,
                    `${metric.timeFieldId}_hour`,
                    `${metric.timeFieldId}_minute`,
                    `${metric.timeFieldId}_second`,
                    `${metric.timeFieldId}_ts`
                  ]
                : [
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'year' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'quarter' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'month' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'week' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'date' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'hour' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'minute' satisfies Timeframe}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${'time' satisfies Timeframe}`
                  ];

            this.sortedFieldsY = resp.output.model.fields
              .filter(
                (x: ModelField) =>
                  x.hidden === false &&
                  restrictedFilterFieldIds.indexOf(x.id) < 0
              )
              .map((x: ModelField) =>
                Object.assign({}, x, {
                  partLabel: isDefined(x.groupLabel)
                    ? `${x.topLabel} ${x.groupLabel} ${x.label}`
                    : `${x.topLabel} ${x.label}`
                } as ModelFieldY)
              )
              .sort((a: ModelFieldY, b: ModelFieldY) =>
                a.fieldClass !== 'dimension' && b.fieldClass === 'dimension'
                  ? 1
                  : a.fieldClass === 'dimension' && b.fieldClass !== 'dimension'
                    ? -1
                    : a.fieldClass !== 'filter' && b.fieldClass === 'filter'
                      ? 1
                      : a.fieldClass === 'filter' && b.fieldClass !== 'filter'
                        ? -1
                        : a.partLabel > b.partLabel
                          ? 1
                          : b.partLabel > a.partLabel
                            ? -1
                            : 0
              );

            this.model = resp.output.model;

            this.modelLoading = false;

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  fieldChange() {
    (document.activeElement as HTMLElement).blur();

    this.isFieldAlreadyFiltered =
      this.ref.data.reportSelectedNode.data.mconfig.extendedFilters
        .map(filter => filter.fieldId)
        .indexOf(this.newFieldId) > -1;
  }

  save() {
    if (isUndefined(this.newFieldId)) {
      return;
    }

    let newParameters = isDefined(
      this.ref.data.reportSelectedNode.data.parameters
    )
      ? [...this.ref.data.reportSelectedNode.data.parameters]
      : [];

    let field = this.model.fields.find(x => x.id === this.newFieldId);

    let newFraction: Fraction;

    if (this.model.type === 'Store') {
      let storeFilter =
        field.fieldClass === 'filter'
          ? this.model.storeContent.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFraction =
        field.fieldClass === 'filter'
          ? undefined
          : this.model.storeContent.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup: FractionLogic = isUndefined(storeResultFraction)
        ? undefined
        : 'OR';

      let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
        ? []
        : this.model.storeContent.results
            .find(r => r.result === field.result)
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

      newFraction = {
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
        storeResult: field.result,
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
        controls: isUndefined(storeResultFraction)
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
          : this.model.storeContent.results
              .find(r => r.result === field.result)
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
              })
      };
    } else if (this.model.type === 'Malloy') {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: 'Or',
        type: getFractionTypeForAny({ result: field.result })
      };
    } else {
      newFraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: 'Or',
        type: getFractionTypeForAny({ result: field.result })
      };
    }

    let newParameter: Parameter = {
      apply_to: field.id,
      fractions: [newFraction],
      listen: undefined
    };

    newParameters = [...newParameters, newParameter];

    let report = this.reportQuery.getValue();

    let rowChange: RowChange = {
      rowId: this.ref.data.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditParameters',
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });

    this.ref.close();
  }

  searchFn(term: string, modelField: ModelField) {
    let haystack = [
      isDefinedAndNotEmpty(modelField.groupLabel)
        ? `${modelField.topLabel} ${modelField.groupLabel} - ${modelField.label}`
        : `${modelField.topLabel} ${modelField.label}`
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
