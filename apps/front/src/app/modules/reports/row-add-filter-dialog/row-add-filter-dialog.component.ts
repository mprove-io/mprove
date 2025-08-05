import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '~front/app/services/api.service';
import { common } from '~front/barrels/common';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { TippyDirective } from '@ngneat/helipopper';
import { IRowNode } from 'ag-grid-community';
import { take, tap } from 'rxjs';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { DataRow } from '~front/app/interfaces/data-row';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ReportService } from '~front/app/services/report.service';
import { apiToBackend } from '~front/barrels/api-to-backend';

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
  model: common.Model;

  sortedFieldsY: common.ModelFieldY[];

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

    let payload: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: metric.modelId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let restrictedFilterFieldIds = [
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Year}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Quarter}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Month}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Week}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Date}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Hour}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Minute}`,
              `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${common.TimeframeEnum.Time}`
            ];

            this.sortedFieldsY = resp.payload.model.fields
              .filter(
                (x: common.ModelField) =>
                  x.hidden === false &&
                  restrictedFilterFieldIds.indexOf(x.id) < 0
              )
              .map((x: common.ModelField) =>
                Object.assign({}, x, {
                  partLabel: common.isDefined(x.groupLabel)
                    ? `${x.topLabel} ${x.groupLabel} ${x.label}`
                    : `${x.topLabel} ${x.label}`
                } as common.ModelFieldY)
              )
              .sort((a: common.ModelFieldY, b: common.ModelFieldY) =>
                a.fieldClass !== common.FieldClassEnum.Dimension &&
                b.fieldClass === common.FieldClassEnum.Dimension
                  ? 1
                  : a.fieldClass === common.FieldClassEnum.Dimension &&
                      b.fieldClass !== common.FieldClassEnum.Dimension
                    ? -1
                    : a.fieldClass !== common.FieldClassEnum.Filter &&
                        b.fieldClass === common.FieldClassEnum.Filter
                      ? 1
                      : a.fieldClass === common.FieldClassEnum.Filter &&
                          b.fieldClass !== common.FieldClassEnum.Filter
                        ? -1
                        : a.partLabel > b.partLabel
                          ? 1
                          : b.partLabel > a.partLabel
                            ? -1
                            : 0
              );

            // console.log(this.fieldsList[0]);
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
    if (common.isUndefined(this.newFieldId)) {
      return;
    }

    let newParameters = common.isDefined(
      this.ref.data.reportSelectedNode.data.parameters
    )
      ? [...this.ref.data.reportSelectedNode.data.parameters]
      : [];

    let field = this.model.fields.find(x => x.id === this.newFieldId);

    let newFraction: common.Fraction;

    if (this.model.type === common.ModelTypeEnum.Store) {
      let storeFilter =
        field.fieldClass === common.FieldClassEnum.Filter
          ? (this.model.content as common.FileStore).fields.find(
              f => f.name === field.id
            )
          : undefined;

      let storeResultFraction =
        field.fieldClass === common.FieldClassEnum.Filter
          ? undefined
          : (this.model.content as common.FileStore).results.find(
              r => r.result === field.result
            ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFraction)
        ? undefined
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(storeResultFraction)
        ? []
        : (this.model.content as common.FileStore).results
            .find(r => r.result === field.result)
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

      newFraction = {
        meta: storeResultFraction?.meta,
        operator: common.isUndefined(logicGroup)
          ? undefined
          : logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: field.result,
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
        controls: common.isUndefined(storeResultFraction)
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
          : (this.model.content as common.FileStore).results
              .find(r => r.result === field.result)
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
              })
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(field.result)
      };
    }

    let newParameter: common.Parameter = {
      apply_to: field.id,
      fractions: [newFraction],
      listen: undefined
    };

    newParameters = [...newParameters, newParameter];

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.ref.data.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });

    this.ref.close();
  }

  searchFn(term: string, modelField: common.ModelField) {
    // let haystack = [
    //   common.isDefinedAndNotEmpty(modelFieldY.groupLabel)
    //     ? `${modelFieldY.topLabel} ${modelFieldY.groupLabel} - ${modelFieldY.label}`
    //     : `${modelFieldY.topLabel} ${modelFieldY.label}`
    // ];

    let haystack = [
      common.isDefinedAndNotEmpty(modelField.groupLabel)
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
