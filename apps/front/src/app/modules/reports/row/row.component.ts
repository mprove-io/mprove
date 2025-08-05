import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { DataRow } from '~front/app/interfaces/data-row';
import { NavQuery } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { DataService } from '~front/app/services/data.service';
import { ReportService } from '~front/app/services/report.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { StructQuery } from '~front/app/queries/struct.query';
import { MyDialogService } from '~front/app/services/my-dialog.service';

export interface FilterX2 extends common.FilterX {
  listen: string;
}

@Component({
  standalone: false,
  selector: 'm-row',
  templateUrl: './row.component.html'
})
export class RowComponent {
  @ViewChild('formatNumberSelect', { static: false })
  formatNumberSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.formatNumberSelectElement?.close();
  }

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

  isValid = false;

  report: common.ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.resetInputs();
      this.report = x;

      this.cd.detectChanges();
    })
  );

  reportSelectedNodes: IRowNode<DataRow>[] = [];
  reportSelectedNode: IRowNode<DataRow>;

  mconfig: common.MconfigX;
  parametersFilters: FilterX2[] = [];

  showMetricsChart: boolean;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      if (
        (this.isToHeader === true ||
          this.isToFormula === true ||
          this.isToMetric === true) &&
        (x.reportSelectedNodes.length === 0 ||
          x.reportSelectedNodes.length > 1 ||
          (x.reportSelectedNodes.length === 1 &&
            x.reportSelectedNodes[0].data.rowId !==
              this.reportSelectedNode.data.rowId))
      ) {
        this.resetInputs();
      }

      this.showMetricsChart = x.showMetricsChart;

      this.reportSelectedNodes = x.reportSelectedNodes;

      this.reportSelectedNode =
        this.reportSelectedNodes.length === 1
          ? this.reportSelectedNodes[0]
          : undefined;

      if (common.isDefined(this.reportSelectedNode)) {
        let struct = this.structQuery.getValue();

        this.formatNumberExamples = constants.FORMAT_NUMBER_EXAMPLES.map(
          example => {
            example.output = this.dataService.formatValue({
              value: example.input,
              formatNumber: example.id,
              fieldResult: common.FieldResultEnum.Number,
              currencyPrefix: this.reportSelectedNode.data.currencyPrefix,
              currencySuffix: this.reportSelectedNode.data.currencySuffix,
              thousandsSeparator: struct.thousandsSeparator
            });

            return example;
          }
        );
      }

      // console.log('selectedRowNode', this.repSelectedNode);

      if (
        common.isDefined(this.reportSelectedNode) &&
        this.reportSelectedNode.data.rowType === common.RowTypeEnum.Metric
      ) {
        this.mconfig = this.reportSelectedNode.data.mconfig;

        // let metric = this.structQuery
        //   .getValue()
        //   .metrics.find(y => y.metricId === this.repSelectedNode.data.metricId);

        // let timeSpec = this.repQuery.getValue().timeSpec;

        // let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

        // let timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

        this.parametersFilters =
          this.reportSelectedNode.data.mconfig.extendedFilters
            .filter(
              (
                filter // TODO: row store parametersFiltersWithExcludedTime
              ) =>
                this.reportSelectedNode.data.mconfig.modelType ===
                common.ModelTypeEnum.Store
                  ? // this.reportSelectedNode.data.mconfig.isStoreModel === true
                    this.reportSelectedNode.data.mconfig.filters
                      .map(f => f.fieldId)
                      .indexOf(filter.fieldId) > -1
                  : this.reportSelectedNode.data.parametersFiltersWithExcludedTime
                      .map(f => f.fieldId)
                      .indexOf(filter.fieldId) > -1
            )
            .map(filter => {
              let parameter = this.reportSelectedNode.data.parameters.find(
                y => y.apply_to === filter.fieldId
              );

              return Object.assign({}, filter, {
                listen: parameter?.listen
              } as FilterX2);
            });
      }

      if (common.isDefined(this.reportSelectedNode)) {
        if (
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Formula
        ) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.reportSelectedNode.data.formula
          });
        }

        if (
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Header ||
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Formula
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.reportSelectedNode.data.name
          });
        }

        if (
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Formula ||
          this.reportSelectedNode.data.rowType === common.RowTypeEnum.Metric
        ) {
          setValueAndMark({
            control: this.formatNumberForm.controls['formatNumber'],
            value: this.reportSelectedNode.data.formatNumber
          });

          setValueAndMark({
            control: this.currencyPrefixForm.controls['currencyPrefix'],
            value: this.reportSelectedNode.data.currencyPrefix
          });

          setValueAndMark({
            control: this.currencySuffixForm.controls['currencySuffix'],
            value: this.reportSelectedNode.data.currencySuffix
          });
        }
      }

      this.cd.detectChanges();
    })
  );

  newMetricId: string;

  metrics: common.ModelMetric[];
  metrics$ = this.structQuery.select().pipe(
    tap(x => {
      this.metrics = x.metrics;
      this.cd.detectChanges();
    })
  );

  fieldsList: common.ModelFieldY[] = [];
  fieldsListLoading = false;

  formatNumberExamples: any = [];

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private fb: FormBuilder,
    private myDialogService: MyDialogService,
    private reportService: ReportService,
    private reportQuery: ReportQuery,
    private apiService: ApiService,
    private dataService: DataService,
    private navQuery: NavQuery
  ) {}

  formulaBlur() {
    let value = this.formulaForm.controls['formula'].value;

    if (
      !this.formulaForm.valid ||
      this.reportSelectedNode.data.formula === value
    ) {
      return;
    }

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      formula: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditFormula,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  nameBlur() {
    let value = this.nameForm.controls['name'].value;

    if (!this.nameForm.valid || this.reportSelectedNode.data.name === value) {
      return;
    }

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      name: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  newMetricChange() {
    (document.activeElement as HTMLElement).blur();
  }

  formatNumberBlur() {
    (document.activeElement as HTMLElement).blur();

    let value = this.formatNumberForm.controls['formatNumber'].value;

    if (
      !this.formatNumberForm.valid ||
      this.reportSelectedNode.data.formatNumber === value
    ) {
      return;
    }

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      formatNumber: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  currencyPrefixBlur() {
    let value = this.currencyPrefixForm.controls['currencyPrefix'].value;

    if (
      !this.currencyPrefixForm.valid ||
      this.reportSelectedNode.data.currencyPrefix === value
    ) {
      return;
    }

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      currencyPrefix: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  currencySuffixBlur() {
    let value = this.currencySuffixForm.controls['currencySuffix'].value;

    if (
      !this.currencySuffixForm.valid ||
      this.reportSelectedNode.data.currencySuffix === value
    ) {
      return;
    }

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      currencySuffix: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  clearRows() {
    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.Clear,
      rowChange: undefined,
      rowIds: this.reportSelectedNodes.map(node => node.data.rowId),
      reportFields: this.report.fields,
      chart: undefined
    });
  }

  deleteRows() {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.Delete,
      rowChange: undefined,
      rowIds: this.reportSelectedNodes.map(node => node.data.rowId),
      reportFields: this.report.fields,
      chart: undefined
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
        rowId: this.reportSelectedNode.data.rowId,
        name: this.newNameForm.controls['name'].value
      };

      this.reportService.modifyRows({
        report: this.report,
        changeType: common.ChangeTypeEnum.ConvertToHeader,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: this.report.fields,
        chart: undefined
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
        rowId: this.reportSelectedNode.data.rowId,
        name: this.newNameForm.controls['name'].value,
        formula: this.newFormulaForm.controls['formula'].value
      };

      this.reportService.modifyRows({
        report: this.report,
        changeType: common.ChangeTypeEnum.ConvertToFormula,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: this.report.fields,
        chart: undefined
      });
    }

    if (this.isToMetric) {
      if (common.isUndefined(this.newMetricId)) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: this.reportSelectedNode.data.rowId,
        metricId: this.newMetricId
      };

      this.reportService.modifyRows({
        report: this.report,
        changeType: common.ChangeTypeEnum.ConvertToMetric,
        rowChange: rowChange,
        rowIds: undefined,
        reportFields: this.report.fields,
        chart: undefined
      });
    }
  }

  deselect() {
    this.uiQuery.getValue().gridApi.deselectAll();
  }

  toggleShowFormatOptions() {
    this.isShowFormatOptions = !this.isShowFormatOptions;
    this.cd.detectChanges();
  }

  addParameter() {
    this.myDialogService.showRowAddFilter({
      apiService: this.apiService,
      reportSelectedNode: this.reportSelectedNode
    });
  }

  newMetricSearchFn(term: string, metric: common.ModelMetric) {
    let haystack = [
      `${metric.topLabel} ${metric.partNodeLabel} ${metric.partFieldLabel} by ${metric.timeNodeLabel} ${metric.timeFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}
