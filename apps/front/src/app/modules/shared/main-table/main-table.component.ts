import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '~common/functions/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '~common/functions/sort-fields-on-select-change';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { Sorting } from '~common/interfaces/blockml/sorting';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { QDataRow } from '~front/app/services/data.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { StructService } from '~front/app/services/struct.service';

@Component({
  standalone: false,
  selector: 'm-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['main-table.component.scss']
})
export class MainTableComponent {
  fieldClassDimension = FieldClassEnum.Dimension;
  fieldClassMeasure = FieldClassEnum.Measure;
  fieldClassCalculation = FieldClassEnum.Calculation;

  fieldResultNumber = FieldResultEnum.Number;

  @Input()
  isTableHeaderWide: boolean;

  @Input()
  isFormat = true;

  @Input()
  modelFields: ModelField[];

  @Input()
  mconfigFields: MconfigField[];

  // mconfigDimensions: MconfigField[] = [];
  // mconfigNotDimensions: MconfigField[] = [];

  @Input()
  qData: QDataRow[];

  @Input()
  mconfig: MconfigX;

  @Input()
  isEdit: boolean;

  chart: ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
    })
  );

  isDrag = false;

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

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('changes');
  //   console.log(changes);

  //   if (isDefined(changes.mconfigFields?.currentValue)) {
  //     this.mconfigDimensions = (
  //       changes.mconfigFields.currentValue as any
  //     ).filter(
  //       (x: MconfigField) =>
  //         x.fieldClass === FieldClassEnum.Dimension
  //     );

  //     this.mconfigNotDimensions = (
  //       changes.mconfigFields.currentValue as any
  //     ).filter(
  //       (x: MconfigField) =>
  //         x.fieldClass !== FieldClassEnum.Dimension
  //     );
  //   }
  // }

  sort(fieldId: string, desc: boolean) {
    // const { fieldId, desc } = params;
    let newMconfig = this.structService.makeMconfig();

    if (this.mconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Sort,
          sortFieldId: fieldId,
          desc: desc,
          timezone: newMconfig.timezone
        }
      });
    } else {
      let newSortings: Sorting[] = [];

      let fIndex = newMconfig.sortings.findIndex(
        sorting => sorting.fieldId === fieldId
      );

      if (fIndex > -1 && newMconfig.sortings[fIndex].desc === true && desc) {
        // desc should be removed from sortings and asc should be added to end

        let sorting: Sorting = { fieldId: fieldId, desc: false };

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
        let sorting: Sorting = { fieldId: fieldId, desc: desc };

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

  replaceColumn(column: MconfigField) {
    this.myDialogService.showReplaceColumnField({
      apiService: this.apiService,
      chart: this.chart,
      fields: this.modelFields,
      currentField: column
    });
  }

  remove(fieldId: string) {
    let newMconfig = this.structService.makeMconfig();

    let fields: ModelField[] = this.modelQuery.getValue().fields;

    if (this.mconfig.modelType === ModelTypeEnum.Malloy) {
      let { queryOperationType, sortFieldId, desc } = sortFieldsOnSelectChange({
        mconfig: newMconfig,
        selectFieldId: fieldId,
        modelFields: fields,
        mconfigFields: this.mconfig.fields
      });

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Remove,
          fieldId: fieldId,
          sortFieldId: sortFieldId,
          desc: desc,
          timezone: newMconfig.timezone
        }
      });
    } else {
      newMconfig = this.mconfigService.removeField({
        newMconfig,
        fieldId: fieldId
      });

      newMconfig = setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: fields
      });

      newMconfig = setChartFields({
        mconfig: newMconfig,
        fields: fields
      });

      newMconfig = sortChartFieldsOnSelectChange({
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
  }

  // moveLeft(columnId: string) {
  //   let sortedSelect = this.mconfigFields.map(x => x.id);
  //   let index = sortedSelect.indexOf(columnId);

  //   let newColumnsOrder = Array.from(sortedSelect);

  //   let toIndex: number = index - 1;

  //   newColumnsOrder[index] = newColumnsOrder[toIndex];
  //   newColumnsOrder[toIndex] = columnId;

  //   let newMconfig = this.structService.makeMconfig();

  //   if (this.mconfig.modelType === ModelTypeEnum.Malloy) {
  //     let queryOperation: QueryOperation = {
  //       type: QueryOperationTypeEnum.Move,
  //       moveFieldIds: newColumnsOrder,
  //       timezone: newMconfig.timezone
  //     };

  //     this.chartService.editChart({
  //       mconfig: newMconfig,
  //       isDraft: this.chart.draft,
  //       chartId: this.chart.chartId,
  //       queryOperation: queryOperation
  //     });
  //   } else {
  //     newMconfig.select = newColumnsOrder;

  //     this.chartService.editChart({
  //       mconfig: newMconfig,
  //       isDraft: this.chart.draft,
  //       chartId: this.chart.chartId
  //     });

  //     // this.mconfigService.navCreateTempMconfigAndQuery({
  //     //   newMconfig: newMconfig
  //     // });
  //   }
  // }

  // moveRight(columnId: string) {
  //   let sortedSelect = this.mconfigFields.map(x => x.id);
  //   let index = sortedSelect.indexOf(columnId);

  //   let newColumnsOrder = Array.from(sortedSelect);

  //   let toIndex: number = index + 1;

  //   newColumnsOrder[index] = sortedSelect[toIndex];
  //   newColumnsOrder[toIndex] = columnId;

  //   let newMconfig = this.structService.makeMconfig();

  //   if (this.mconfig.modelType === ModelTypeEnum.Malloy) {
  //     let queryOperation: QueryOperation = {
  //       type: QueryOperationTypeEnum.Move,
  //       moveFieldIds: newColumnsOrder,
  //       timezone: newMconfig.timezone
  //     };

  //     this.chartService.editChart({
  //       mconfig: newMconfig,
  //       isDraft: this.chart.draft,
  //       chartId: this.chart.chartId,
  //       queryOperation: queryOperation
  //     });
  //   } else {
  //     newMconfig.select = newColumnsOrder;

  //     this.chartService.editChart({
  //       mconfig: newMconfig,
  //       isDraft: this.chart.draft,
  //       chartId: this.chart.chartId
  //     });

  //     // this.mconfigService.navCreateTempMconfigAndQuery({
  //     //   newMconfig: newMconfig
  //     // });
  //   }
  // }

  drop(event: CdkDragDrop<string[]>) {
    // console.log('drop event');
    // console.log(event.previousIndex);
    // console.log(event.currentIndex);

    let previousFieldIds = this.mconfigFields.map(x => x.id);

    let newColumnsOrder = [...this.mconfigFields.map(x => x.id)];

    let [movedFieldId] = newColumnsOrder.splice(event.previousIndex, 1);

    newColumnsOrder.splice(event.currentIndex, 0, movedFieldId);

    let dimensions = newColumnsOrder.filter(
      fieldId =>
        this.mconfigFields.find(x => x.id === fieldId).fieldClass ===
        FieldClassEnum.Dimension
    );

    let notDimensions = newColumnsOrder.filter(
      fieldId =>
        this.mconfigFields.find(x => x.id === fieldId).fieldClass !==
        FieldClassEnum.Dimension
    );

    let moveFieldIds = [...dimensions, ...notDimensions];

    if (
      moveFieldIds.every((value, index) => value === previousFieldIds[index])
    ) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();

    if (this.mconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Move,
          moveFieldIds: moveFieldIds,
          timezone: newMconfig.timezone
        }
      });
    } else {
      newMconfig.select = moveFieldIds;

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

  onDragStart() {
    // console.log('dragStarted')
    this.isDrag = true;
    document.body.classList.add('force-cursor-grabbing');
  }

  onDragEnd() {
    // console.log('dragEnded')
    this.isDrag = false;
    document.body.classList.remove('force-cursor-grabbing');
  }
}
