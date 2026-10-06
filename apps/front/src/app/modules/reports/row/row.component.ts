import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import {
  EMPTY_FORMAT_NUMBER,
  FORMAT_NUMBER_EXAMPLES
} from '#common/constants/top-front';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FilterX } from '#common/types/backend/parts/filter/filter-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { RowChange } from '#common/types/blockml/parts/report/row/row-change';
import type { DataRow } from '#common/types/front/report/row/data-row';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { NavQuery } from '#front/app/queries/nav.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { DataService } from '#front/app/services/data.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { ReportService } from '#front/app/services/report.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface FilterX2 extends FilterX {
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

  formulaForm: FormGroup<{
    formula: FormControl<string>;
  }> = this.fb.group({
    formula: this.fb.control<string>(undefined, [Validators.required])
  });

  nameForm: FormGroup<{
    name: FormControl<string>;
  }> = this.fb.group({
    name: this.fb.control<string>(undefined, [Validators.required])
  });

  formatNumberForm: FormGroup<{
    formatNumber: FormControl<string>;
  }> = this.fb.group({
    formatNumber: this.fb.control<string>(undefined, [
      ValidationService.formatNumberValidator,
      Validators.maxLength(255)
    ])
  });

  currencyPrefixForm: FormGroup<{
    currencyPrefix: FormControl<string>;
  }> = this.fb.group({
    currencyPrefix: this.fb.control<string>(undefined, [
      Validators.maxLength(255)
    ])
  });

  currencySuffixForm: FormGroup<{
    currencySuffix: FormControl<string>;
  }> = this.fb.group({
    currencySuffix: this.fb.control<string>(undefined, [
      Validators.maxLength(255)
    ])
  });

  isShowFormatOptions = false;

  isValid = false;

  report: ReportX;
  report$ = this.reportQuery.select().pipe(
    tap(x => {
      this.report = x;
      this.cd.detectChanges();
    })
  );

  reportSelectedNodes: IRowNode<DataRow>[] = [];
  reportSelectedNode: IRowNode<DataRow>;

  mconfig: MconfigX;
  parametersFilters: FilterX2[] = [];

  showMetricsChart: boolean;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.showMetricsChart = x.showMetricsChart;

      this.reportSelectedNodes = x.reportSelectedNodes;

      this.reportSelectedNode =
        this.reportSelectedNodes.length === 1
          ? this.reportSelectedNodes[0]
          : undefined;

      let struct = this.structQuery.getValue();

      if (isDefined(this.reportSelectedNode)) {
        this.formatNumberExamples = FORMAT_NUMBER_EXAMPLES.map(example => {
          example.output =
            example.id === EMPTY_FORMAT_NUMBER
              ? 'Empty'
              : this.dataService.d3FormatValue({
                  value: example.input,
                  formatNumber: example.id,
                  fieldResult: 'number',
                  currencyPrefix:
                    this.reportSelectedNode.data.currencyPrefix ??
                    struct.mproveConfig.currencyPrefix,
                  currencySuffix:
                    this.reportSelectedNode.data.currencySuffix ??
                    struct.mproveConfig.currencySuffix,
                  thousandsSeparator: struct.mproveConfig.thousandsSeparator
                });

          return example;
        });
      }

      if (
        isDefined(this.reportSelectedNode) &&
        this.reportSelectedNode.data.rowType === 'metric'
      ) {
        this.mconfig = this.reportSelectedNode.data.mconfig;

        this.parametersFilters =
          this.reportSelectedNode.data.mconfig.extendedFilters
            .filter(
              (
                filter // TODO: row store parametersFiltersWithExcludedTime
              ) =>
                this.reportSelectedNode.data.mconfig.modelType === 'Store'
                  ? this.reportSelectedNode.data.mconfig.filters
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

      if (isDefined(this.reportSelectedNode)) {
        if (this.reportSelectedNode.data.rowType === 'formula') {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.reportSelectedNode.data.formula
          });
        }

        if (
          this.reportSelectedNode.data.rowType === 'header' ||
          this.reportSelectedNode.data.rowType === 'formula'
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.reportSelectedNode.data.name
          });
        }

        if (
          this.reportSelectedNode.data.rowType === 'formula' ||
          this.reportSelectedNode.data.rowType === 'metric'
        ) {
          setValueAndMark({
            control: this.formatNumberForm.controls['formatNumber'],
            value: this.reportSelectedNode.data.formatNumber
          });

          setValueAndMark({
            control: this.currencyPrefixForm.controls['currencyPrefix'],
            value:
              this.reportSelectedNode.data.currencyPrefix ??
              struct.mproveConfig.currencyPrefix
          });

          setValueAndMark({
            control: this.currencySuffixForm.controls['currencySuffix'],
            value:
              this.reportSelectedNode.data.currencySuffix ??
              struct.mproveConfig.currencySuffix
          });
        }
      }

      this.cd.detectChanges();
    })
  );

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

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      formula: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditFormula',
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

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      name: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditInfo',
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
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

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      formatNumber: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditInfo',
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

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      currencyPrefix: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditInfo',
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

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      currencySuffix: value
    };

    this.reportService.modifyRows({
      report: report,
      changeType: 'EditInfo',
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  deleteRows() {
    this.uiQuery.getValue().gridApi.deselectAll();

    this.reportService.modifyRows({
      report: this.report,
      changeType: 'Delete',
      rowChange: undefined,
      rowIds: this.reportSelectedNodes.map(node => node.data.rowId),
      reportFields: this.report.fields,
      chart: undefined
    });
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
}
