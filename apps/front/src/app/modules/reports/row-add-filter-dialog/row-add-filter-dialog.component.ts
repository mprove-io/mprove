import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { IRowNode } from 'ag-grid-community';
import { NgxSpinnerModule } from 'ngx-spinner';
import { take, tap } from 'rxjs';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '~common/constants/top';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { TimeframeEnum } from '~common/enums/timeframe.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { Model } from '~common/interfaces/blockml/model';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelFieldY } from '~common/interfaces/blockml/model-field-y';
import { Parameter } from '~common/interfaces/blockml/parameter';
import { RowChange } from '~common/interfaces/blockml/row-change';
import { DataRow } from '~common/interfaces/front/data-row';
import {
  ToBackendGetModelRequestPayload,
  ToBackendGetModelResponse
} from '~common/interfaces/to-backend/models/to-backend-get-model';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { ReportService } from '~front/app/services/report.service';
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

  addFilterForm: FormGroup;

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
      field: [undefined]
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

    let payload: ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: metric.modelId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetModelResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let restrictedFilterFieldIds =
              metric.modelType === ModelTypeEnum.Malloy
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
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Year}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Quarter}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Month}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Week}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Date}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Hour}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Minute}`,
                    `${metric.timeFieldId}${TRIPLE_UNDERSCORE}${TimeframeEnum.Time}`
                  ];

            this.sortedFieldsY = resp.payload.model.fields
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
                a.fieldClass !== FieldClassEnum.Dimension &&
                b.fieldClass === FieldClassEnum.Dimension
                  ? 1
                  : a.fieldClass === FieldClassEnum.Dimension &&
                      b.fieldClass !== FieldClassEnum.Dimension
                    ? -1
                    : a.fieldClass !== FieldClassEnum.Filter &&
                        b.fieldClass === FieldClassEnum.Filter
                      ? 1
                      : a.fieldClass === FieldClassEnum.Filter &&
                          b.fieldClass !== FieldClassEnum.Filter
                        ? -1
                        : a.partLabel > b.partLabel
                          ? 1
                          : b.partLabel > a.partLabel
                            ? -1
                            : 0
              );

            this.model = resp.payload.model;

            this.modelLoading = false;
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

    if (this.model.type === ModelTypeEnum.Store) {
      let storeFilter =
        field.fieldClass === FieldClassEnum.Filter
          ? this.model.storeContent.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFraction =
        field.fieldClass === FieldClassEnum.Filter
          ? undefined
          : this.model.storeContent.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup = isUndefined(storeResultFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
        ? []
        : this.model.storeContent.results
            .find(r => r.result === field.result)
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

      newFraction = {
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
    } else if (this.model.type === ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(field.result)
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
      changeType: ChangeTypeEnum.EditParameters,
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
