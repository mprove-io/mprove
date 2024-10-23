import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { RepService } from '~front/app/services/rep.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep/rep.component';

export interface ParameterFilter extends common.FilterX {
  parameterType: common.ParameterTypeEnum;
  isJsonValid: boolean;
  isSchemaValid: boolean;
  schemaError: string;
  formula: string;
}

interface ModelFieldY extends common.ModelField {
  partLabel: string;
}

@Component({
  selector: 'm-row',
  templateUrl: './row.component.html'
})
export class RowComponent {
  rowTypeFormula = common.RowTypeEnum.Formula;
  rowTypeMetric = common.RowTypeEnum.Metric;
  rowTypeHeader = common.RowTypeEnum.Header;
  rowTypeEmpty = common.RowTypeEnum.Empty;

  formulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  nameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.required]]
  });

  newFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  parametersFormulaForm: FormGroup = this.fb.group({
    formula: [undefined, [Validators.required]]
  });

  formatNumberForm: FormGroup = this.fb.group({
    formatNumber: [
      undefined,
      [ValidationService.formatNumberValidator, Validators.maxLength(255)]
    ]
  });

  currencyPrefixForm: FormGroup = this.fb.group({
    currencyPrefix: [undefined, [Validators.maxLength(255)]]
  });

  currencySuffixForm: FormGroup = this.fb.group({
    currencySuffix: [undefined, [Validators.maxLength(255)]]
  });

  isShowFormatOptions = false;

  isToHeader = false;
  isToFormula = false;
  isToMetric = false;

  isAddParameter = false;
  isDisabledApplyTimeField = false;
  isDisabledApplyAlreadyFiltered = false;

  isValid = false;

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.resetInputs();
      this.rep = x;

      this.cd.detectChanges();
    })
  );

  repSelectedNodes: IRowNode<DataRow>[] = [];
  repSelectedNode: IRowNode<DataRow>;

  mconfig: common.MconfigX;
  parametersFilters: ParameterFilter[] = [];

  showMetricsChart: boolean;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      if (
        (this.isToHeader === true ||
          this.isToFormula === true ||
          this.isToMetric === true ||
          this.isAddParameter === true) &&
        (x.repSelectedNodes.length === 0 ||
          x.repSelectedNodes.length > 1 ||
          (x.repSelectedNodes.length === 1 &&
            x.repSelectedNodes[0].data.rowId !==
              this.repSelectedNode.data.rowId))
      ) {
        this.resetInputs();
      }

      this.showMetricsChart = x.showMetricsChart;

      this.repSelectedNodes = x.repSelectedNodes;

      this.repSelectedNode =
        this.repSelectedNodes.length === 1
          ? this.repSelectedNodes[0]
          : undefined;

      console.log('selectedRowNode', this.repSelectedNode);

      if (
        common.isDefined(this.repSelectedNode) &&
        this.repSelectedNode.data.rowType === common.RowTypeEnum.Metric
      ) {
        this.mconfig = this.repSelectedNode.data.mconfig;

        // let metric = this.metricsQuery
        //   .getValue()
        //   .metrics.find(y => y.metricId === this.repSelectedNode.data.metricId);

        // let timeSpec = this.repQuery.getValue().timeSpec;

        // let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

        // let timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters =
          this.repSelectedNode.data.mconfig.extendedFilters
            .filter(
              filter =>
                this.repSelectedNode.data.parametersFiltersWithExcludedTime
                  .map(f => f.fieldId)
                  .indexOf(filter.fieldId) > -1
            )
            .map(filter => {
              let parameter = this.repSelectedNode.data.parameters.find(
                y => y.filter === filter.fieldId
              );

              return Object.assign({}, filter, {
                parameterType: parameter.parameterType,
                formula: parameter.formula,
                isJsonValid: parameter.isJsonValid,
                isSchemaValid: parameter.isSchemaValid,
                schemaError: parameter.schemaError
              } as ParameterFilter);
            });
      }

      if (common.isDefined(this.repSelectedNode)) {
        if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Metric) {
          setValueAndMark({
            control: this.parametersFormulaForm.controls['formula'],
            value: this.repSelectedNode.data.parametersFormula
          });
        }

        if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.repSelectedNode.data.formula
          });
        }

        if (
          this.repSelectedNode.data.rowType === common.RowTypeEnum.Header ||
          this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.repSelectedNode.data.name
          });
        }

        if (
          this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula ||
          this.repSelectedNode.data.rowType === common.RowTypeEnum.Metric
        ) {
          setValueAndMark({
            control: this.formatNumberForm.controls['formatNumber'],
            value: this.repSelectedNode.data.formatNumber
          });

          setValueAndMark({
            control: this.currencyPrefixForm.controls['currencyPrefix'],
            value: this.repSelectedNode.data.currencyPrefix
          });

          setValueAndMark({
            control: this.currencySuffixForm.controls['currencySuffix'],
            value: this.repSelectedNode.data.currencySuffix
          });
        }
      }

      this.cd.detectChanges();
    })
  );

  newMetricId: string;
  newParameterId: string;
  newParameterModel: common.Model;

  metrics: common.MetricAny[];
  metrics$ = this.metricsQuery.select().pipe(
    tap(x => {
      this.metrics = x.metrics;
      this.cd.detectChanges();
    })
  );

  fieldsList: ModelFieldY[] = [];
  fieldsListLoading = false;

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private metricsQuery: MetricsQuery,
    private fb: FormBuilder,
    private repService: RepService,
    private repQuery: RepQuery,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private mconfigService: MconfigService
  ) {}

  formulaBlur() {
    let value = this.formulaForm.controls['formula'].value;

    if (
      !this.formulaForm.valid ||
      this.repSelectedNode.data.formula === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      formula: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditFormula,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  nameBlur() {
    let value = this.nameForm.controls['name'].value;

    if (!this.nameForm.valid || this.repSelectedNode.data.name === value) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      name: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  parametersFormulaBlur() {
    let value = this.parametersFormulaForm.controls['formula'].value;

    if (
      !this.parametersFormulaForm.valid ||
      this.repSelectedNode.data.parametersFormula === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parametersFormula: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  formatNumberBlur() {
    let value = this.formatNumberForm.controls['formatNumber'].value;

    if (
      !this.formatNumberForm.valid ||
      this.repSelectedNode.data.formatNumber === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      formatNumber: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  currencyPrefixBlur() {
    let value = this.currencyPrefixForm.controls['currencyPrefix'].value;

    if (
      !this.currencyPrefixForm.valid ||
      this.repSelectedNode.data.currencyPrefix === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      currencyPrefix: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  currencySuffixBlur() {
    let value = this.currencySuffixForm.controls['currencySuffix'].value;

    if (
      !this.currencySuffixForm.valid ||
      this.repSelectedNode.data.currencySuffix === value
    ) {
      return;
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      currencySuffix: value
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  clearRows() {
    this.repService.modifyRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Clear,
      rowChange: undefined,
      rowIds: this.repSelectedNodes.map(node => node.data.rowId)
    });
  }

  deleteRows() {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.repService.modifyRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Delete,
      rowChange: undefined,
      rowIds: this.repSelectedNodes.map(node => node.data.rowId)
    });
  }

  toHeader() {
    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.isToHeader = true;
  }

  toFormula() {
    this.newFormulaForm.controls['formula'].setValue(undefined);
    this.newFormulaForm.controls['formula'].markAsUntouched();

    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.isToFormula = true;
  }

  toMetric() {
    this.isToMetric = true;
  }

  resetInputs() {
    this.newNameForm.controls['name'].setValue(undefined);
    this.newNameForm.controls['name'].markAsUntouched();

    this.newFormulaForm.controls['formula'].setValue(undefined);
    this.newFormulaForm.controls['formula'].markAsUntouched();

    this.newMetricId = undefined;

    this.isToHeader = false;
    this.isToFormula = false;
    this.isToMetric = false;

    this.isAddParameter = false;
    this.newParameterId = undefined;
    this.newParameterModel = undefined;
  }

  cancelConvert() {
    this.resetInputs();
  }

  applyConvert() {
    if (this.isToHeader === true) {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: this.repSelectedNode.data.rowId,
        name: this.newNameForm.controls['name'].value
      };

      this.repService.modifyRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToHeader,
        rowChange: rowChange,
        rowIds: undefined
      });
    }

    if (this.isToFormula === true) {
      this.newNameForm.controls['name'].markAsTouched();
      this.newFormulaForm.controls['formula'].markAsTouched();

      if (
        this.newNameForm.valid === false ||
        this.newFormulaForm.valid === false
      ) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: this.repSelectedNode.data.rowId,
        name: this.newNameForm.controls['name'].value,
        formula: this.newFormulaForm.controls['formula'].value
      };

      this.repService.modifyRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToFormula,
        rowChange: rowChange,
        rowIds: undefined
      });
    }

    if (this.isToMetric) {
      if (common.isUndefined(this.newMetricId)) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: this.repSelectedNode.data.rowId,
        metricId: this.newMetricId
      };

      this.repService.modifyRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToMetric,
        rowChange: rowChange,
        rowIds: undefined
      });
    }
  }

  explore() {
    if (this.repSelectedNode.data.hasAccessToModel === true) {
      this.mconfigService.navDuplicateMconfigAndQuery({
        oldMconfigId: this.repSelectedNode.data.mconfig.mconfigId
      });
    }
  }

  toggleShowFormatOptions() {
    this.isShowFormatOptions = !this.isShowFormatOptions;
    this.cd.detectChanges();
  }

  addParameter() {
    this.isAddParameter = true;
  }

  openAddParameterSelect() {
    let nav = this.navQuery.getValue();

    let metric = this.metricsQuery
      .getValue()
      .metrics.find(y => y.metricId === this.repSelectedNode.data.metricId);

    this.fieldsListLoading = true;

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
            this.fieldsList = resp.payload.model.fields
              .map(x =>
                Object.assign({}, x, {
                  partLabel: common.isDefined(x.groupLabel)
                    ? `${x.topLabel} ${x.groupLabel} ${x.label}`
                    : `${x.topLabel} ${x.label}`
                } as ModelFieldY)
              )
              .sort((a, b) =>
                a.partLabel > b.partLabel
                  ? 1
                  : b.partLabel > a.partLabel
                  ? -1
                  : 0
              );

            // console.log(this.fieldsList[0]);
            this.newParameterModel = resp.payload.model;

            this.fieldsListLoading = false;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  addParameterChange() {
    let metric = this.metricsQuery
      .getValue()
      .metrics.find(y => y.metricId === this.repSelectedNode.data.metricId);

    let timeSpec = this.repQuery.getValue().timeSpec;

    let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

    let timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

    this.isDisabledApplyTimeField = this.newParameterId === timeFieldIdSpec;

    this.isDisabledApplyAlreadyFiltered =
      this.repSelectedNode.data.mconfig.extendedFilters
        .map(filter => filter.fieldId)
        .indexOf(this.newParameterId) > -1;
  }

  cancelAddParameter() {
    this.resetInputs();
  }

  applyAddParameter() {
    if (common.isUndefined(this.newParameterId)) {
      return;
    }

    let newParameters = common.isDefined(this.repSelectedNode.data.parameters)
      ? [...this.repSelectedNode.data.parameters]
      : [];

    let field = this.newParameterModel.fields.find(
      x => x.id === this.newParameterId
    );

    let newParameter: common.Parameter = {
      parameterId: [this.repSelectedNode.data.rowId, ...field.id.split('.')]
        .join('_')
        .toUpperCase(),
      parameterType: common.ParameterTypeEnum.Field,
      filter: field.id,
      result: field.result,
      formula: undefined,
      xDeps: undefined,
      conditions: ['any']
    };

    newParameters = [...newParameters, newParameter];

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  toggleParametersFormula() {
    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange;

    if (common.isDefined(this.repSelectedNode.data.parametersFormula)) {
      rowChange = {
        rowId: this.repSelectedNode.data.rowId,
        parameters: this.repSelectedNode.data.parameters,
        parametersFormula: undefined
      };
    } else {
      rowChange = {
        rowId: this.repSelectedNode.data.rowId,
        parameters: undefined,
        parametersFormula: `return []`
      };
    }

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }
}
