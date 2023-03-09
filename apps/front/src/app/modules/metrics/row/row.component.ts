import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
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
      this.rep = x;

      this.cd.detectChanges();
    })
  );

  repSelectedNode: IRowNode<DataRow>;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.repSelectedNode =
        x.repSelectedNodes.length === 1 ? x.repSelectedNodes[0] : undefined;

      console.log('selectedRowNode', this.repSelectedNode);

      if (common.isDefined(this.repSelectedNode)) {
        if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.repSelectedNode.data.formula
          });
        }

        if (
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Empty &&
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Metric
        ) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.repSelectedNode.data.name
          });
        }

        if (
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Empty &&
          this.repSelectedNode.data.rowType !== common.RowTypeEnum.Header
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

  constructor(
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
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
    this.isToHeader = true;
  }

  toFormula() {
    this.isToFormula = true;
  }

  toMetric() {
    this.isToMetric = true;
  }

  cancel() {
    this.isToHeader = false;
    this.isToFormula = false;
    this.isToMetric = false;
  }

  apply() {
    // this.isToHeader = false;
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
