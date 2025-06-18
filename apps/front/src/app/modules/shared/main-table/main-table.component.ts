import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { QDataRow } from '~front/app/services/data.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-main-table',
  templateUrl: './main-table.component.html'
})
export class MainTableComponent {
  fieldClassDimension = common.FieldClassEnum.Dimension;
  fieldClassMeasure = common.FieldClassEnum.Measure;
  fieldClassCalculation = common.FieldClassEnum.Calculation;

  fieldResultNumber = common.FieldResultEnum.Number;

  @Input()
  isTableHeaderWide: boolean;

  @Input()
  isFormat = true;

  @Input()
  modelFields: common.ModelField[];

  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  qData: QDataRow[];

  @Input()
  mconfig: common.MconfigX;

  @Input()
  isEdit: boolean;

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
    })
  );

  constructor(
    private modelQuery: ModelQuery,
    private chartQuery: ChartQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private mconfigService: MconfigService,
    private chartService: ChartService,
    private structService: StructService,
    private cd: ChangeDetectorRef
  ) {}

  sort(fieldId: string, desc: boolean) {
    // const { fieldId, desc } = params;
    let newMconfig = this.structService.makeMconfig();

    if (this.mconfig.modelType === common.ModelTypeEnum.Malloy) {
      let queryOperation: common.QueryOperation = {
        type: common.QueryOperationTypeEnum.Sort,
        fieldId: fieldId,
        desc: desc,
        timezone: newMconfig.timezone
      };

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: queryOperation
      });
    } else {
      let newSortings: common.Sorting[] = [];

      let fIndex = newMconfig.sortings.findIndex(
        sorting => sorting.fieldId === fieldId
      );

      if (fIndex > -1 && newMconfig.sortings[fIndex].desc === true && desc) {
        // desc should be removed from sortings and asc should be added to end

        let sorting: common.Sorting = { fieldId: fieldId, desc: false };

        newSortings = [
          ...newMconfig.sortings.slice(0, fIndex),
          ...newMconfig.sortings.slice(fIndex + 1),
          sorting
        ];
      } else if (
        fIndex > -1 &&
        newMconfig.sortings[fIndex].desc === true &&
        !desc
      ) {
        // not possible in UI
        // asc should be removed from sortings

        newSortings = [
          ...newMconfig.sortings.slice(0, fIndex),
          ...newMconfig.sortings.slice(fIndex + 1)
        ];
      } else if (fIndex > -1 && newMconfig.sortings[fIndex].desc === false) {
        // asc should be removed from sortings
        newSortings = [
          ...newMconfig.sortings.slice(0, fIndex),
          ...newMconfig.sortings.slice(fIndex + 1)
        ];
      } else if (fIndex < 0) {
        // should be added to sortings
        let sorting: common.Sorting = { fieldId: fieldId, desc: desc };

        newSortings = [...newMconfig.sortings, sorting];
      }

      newMconfig.sortings = newSortings;

      // create sorts
      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc
          ? newSorts.push(`${sorting.fieldId} desc`)
          : newSorts.push(sorting.fieldId)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });

      // this.mconfigService.navCreateTempMconfigAndQuery({
      //   newMconfig: newMconfig
      // });
    }
  }

  replaceColumn(column: common.MconfigField) {
    this.myDialogService.showReplaceColumnField({
      apiService: this.apiService,
      chart: this.chart,
      fields: this.modelFields,
      currentField: column
    });
  }

  remove(columnId: string) {
    let index = this.mconfig.select.indexOf(columnId);

    let newMconfig = this.structService.makeMconfig();

    newMconfig = this.mconfigService.removeField({
      newMconfig,
      fieldId: columnId
    });

    let fields: common.ModelField[];
    this.modelQuery.fields$
      .pipe(
        tap(x => (fields = x)),
        take(1)
      )
      .subscribe();

    newMconfig = common.setChartTitleOnSelectChange({
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig = common.setChartFields({
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig = common.sortChartFieldsOnSelectChange({
      mconfig: newMconfig,
      fields: fields
    });

    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
  }

  moveLeft(columnId: string) {
    let sortedSelect = this.mconfigFields.map(x => x.id);
    let index = sortedSelect.indexOf(columnId);

    let newMconfig = this.structService.makeMconfig();

    let newColumnsOrder = Array.from(sortedSelect);

    let toIndex: number = index - 1;

    newColumnsOrder[index] = newColumnsOrder[toIndex];
    newColumnsOrder[toIndex] = columnId;

    if (this.mconfig.modelType === common.ModelTypeEnum.Malloy) {
      let queryOperation: common.QueryOperation = {
        type: common.QueryOperationTypeEnum.Move,
        moveFieldIds: newColumnsOrder,
        timezone: newMconfig.timezone
      };

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: queryOperation
      });
    } else {
      newMconfig.select = newColumnsOrder;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });

      // this.mconfigService.navCreateTempMconfigAndQuery({
      //   newMconfig: newMconfig
      // });
    }
  }

  moveRight(columnId: string) {
    let sortedSelect = this.mconfigFields.map(x => x.id);
    let index = sortedSelect.indexOf(columnId);

    let newMconfig = this.structService.makeMconfig();

    let newColumnsOrder = Array.from(sortedSelect);

    let toIndex: number = index + 1;

    newColumnsOrder[index] = sortedSelect[toIndex];
    newColumnsOrder[toIndex] = columnId;

    if (this.mconfig.modelType === common.ModelTypeEnum.Malloy) {
      let queryOperation: common.QueryOperation = {
        type: common.QueryOperationTypeEnum.Move,
        moveFieldIds: newColumnsOrder,
        timezone: newMconfig.timezone
      };

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: queryOperation
      });
    } else {
      newMconfig.select = newColumnsOrder;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });

      // this.mconfigService.navCreateTempMconfigAndQuery({
      //   newMconfig: newMconfig
      // });
    }
  }
}
