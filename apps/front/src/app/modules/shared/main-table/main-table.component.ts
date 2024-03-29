import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { setChartFields } from '~front/app/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~front/app/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '~front/app/functions/sort-chart-fields-on-select-change';
import { ModelQuery } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { RData } from '~front/app/services/query.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-main-table',
  templateUrl: './main-table.component.html'
})
export class MainTableComponent {
  fieldClassDimension = common.FieldClassEnum.Dimension;
  fieldClassMeasure = common.FieldClassEnum.Measure;
  fieldClassCalculation = common.FieldClassEnum.Calculation;

  fieldResultNumber = common.FieldResultEnum.Number;

  @Input()
  isFormat = true;

  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  qData: RData[];

  @Input()
  mconfig: common.MconfigX;

  @Input()
  isEdit: boolean;

  // mconfig$ = this.mqQuery.mconfig$.pipe(
  //   tap(x => {
  //     this.mconfig = x;
  //     this.cd.detectChanges();
  //   })
  // );

  constructor(
    private mqQuery: MqQuery,
    private modelQuery: ModelQuery,
    private mconfigService: MconfigService,
    private structService: StructService,
    private cd: ChangeDetectorRef
  ) {}

  sort(fieldId: string, desc: boolean) {
    // const { fieldId, desc } = params;
    let newMconfig = this.structService.makeMconfig();

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

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
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

    newMconfig = setChartTitleOnSelectChange({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig = setChartFields({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig = sortChartFieldsOnSelectChange({
      newMconfig: newMconfig,
      fields: fields
    });

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  moveLeft(columnId: string) {
    let sortedSelect = this.mconfigFields.map(x => x.id);
    let index = sortedSelect.indexOf(columnId);

    let newMconfig = this.structService.makeMconfig();

    let newColumnsOrder = Array.from(sortedSelect);

    let toIndex: number = index - 1;

    newColumnsOrder[index] = newColumnsOrder[toIndex];
    newColumnsOrder[toIndex] = columnId;

    newMconfig.select = newColumnsOrder;

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  moveRight(columnId: string) {
    let sortedSelect = this.mconfigFields.map(x => x.id);
    let index = sortedSelect.indexOf(columnId);

    let newMconfig = this.structService.makeMconfig();

    let newColumnsOrder = Array.from(sortedSelect);

    let toIndex: number = index + 1;

    newColumnsOrder[index] = sortedSelect[toIndex];
    newColumnsOrder[toIndex] = columnId;

    newMconfig.select = newColumnsOrder;

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
