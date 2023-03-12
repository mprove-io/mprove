import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { RepService } from '~front/app/services/rep.service';
import { ValidationService } from '~front/app/services/validation.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep/rep.component';

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

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.resetInputs();
      this.rep = x;

      this.cd.detectChanges();
    })
  );

  repSelectedNode: IRowNode<DataRow>;
  repSelectedNodes: IRowNode<DataRow>[] = [];

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      if (
        (this.isToHeader === true ||
          this.isToFormula === true ||
          this.isToMetric === true) &&
        (x.repSelectedNodes.length === 0 ||
          x.repSelectedNodes.length > 1 ||
          (x.repSelectedNodes.length === 1 &&
            x.repSelectedNodes[0].data.rowId !==
              this.repSelectedNode.data.rowId))
      ) {
        this.resetInputs();
      }

      this.repSelectedNodes = x.repSelectedNodes;

      this.repSelectedNode =
        this.repSelectedNodes.length === 1
          ? this.repSelectedNodes[0]
          : undefined;

      console.log('selectedRowNode', this.repSelectedNode);

      if (common.isDefined(this.repSelectedNode)) {
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

  metrics: common.MetricAny[];
  metrics$ = this.metricsQuery.select().pipe(
    tap(x => {
      this.metrics = x.metrics;
      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private metricsQuery: MetricsQuery,
    private fb: FormBuilder,
    private repService: RepService,
    private repQuery: RepQuery,
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

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditFormula,
      rowChanges: [rowChange]
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

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChanges: [rowChange]
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

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChanges: [rowChange]
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

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChanges: [rowChange]
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

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditInfo,
      rowChanges: [rowChange]
    });
  }

  deleteRow() {
    this.uiQuery.getValue().gridApi.deselectAll();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId
    };

    this.repService.changeRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Delete,
      rowChanges: [rowChange]
    });
  }

  clearRow() {
    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId
    };

    this.repService.changeRows({
      rep: this.rep,
      changeType: common.ChangeTypeEnum.Clear,
      rowChanges: [rowChange]
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

  apply() {
    if (this.isToHeader === true) {
      this.newNameForm.controls['name'].markAsTouched();

      if (this.newNameForm.valid === false) {
        return;
      }

      let rowChange: common.RowChange = {
        rowId: this.repSelectedNode.data.rowId,
        name: this.newNameForm.controls['name'].value
      };

      this.repService.changeRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToHeader,
        rowChanges: [rowChange]
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

      this.repService.changeRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToFormula,
        rowChanges: [rowChange]
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

      this.repService.changeRows({
        rep: this.rep,
        changeType: common.ChangeTypeEnum.ConvertToMetric,
        rowChanges: [rowChange]
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
}
