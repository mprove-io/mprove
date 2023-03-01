import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { DataRow } from '../rep/rep.component';

@Component({
  selector: 'm-row',
  templateUrl: './row.component.html'
})
export class RowComponent {
  repSelectedNodes: any[] = [];
  repSelectedNode: IRowNode<DataRow>;

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

  rep: common.RepX;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;

      // console.log(x);

      // this.queriesLength = this.rep.rows.filter(row =>
      //   common.isDefined(row.query)
      // ).length;

      this.cd.detectChanges();
    })
  );

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      // this.fractions = [x.timeRangeFraction];

      // this.showMetricsChart = x.showMetricsChart;
      // this.showMetricsChartSettings = x.showMetricsChartSettings;
      // this.showChartForSelectedRow = x.showChartForSelectedRow;
      // this.repSelectedNodes = x.repSelectedNodes;

      this.repSelectedNode =
        x.repSelectedNodes.length === 1 ? x.repSelectedNodes[0] : undefined;

      if (common.isDefined(this.repSelectedNode)) {
        if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Formula) {
          setValueAndMark({
            control: this.formulaForm.controls['formula'],
            value: this.repSelectedNode.data.formula
          });
        }

        if (this.repSelectedNode.data.rowType !== common.RowTypeEnum.Empty) {
          setValueAndMark({
            control: this.nameForm.controls['name'],
            value: this.repSelectedNode.data.name
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

  explore() {
    if (this.repSelectedNode.data.hasAccessToModel === true) {
      this.mconfigService.navDuplicateMconfigAndQuery({
        oldMconfigId: this.repSelectedNode.data.mconfig.mconfigId
      });
    }
  }
}
