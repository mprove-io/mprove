import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { NavQuery, NavState } from '../queries/nav.query';

@Injectable({ providedIn: 'root' })
export class MconfigService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(private navQuery: NavQuery) {
    this.nav$.subscribe();
  }

  removeField(item: { newMconfig: MconfigX; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    newMconfig = this.removeFieldFromSelect({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromSortings({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromChart({ newMconfig, fieldId });

    return newMconfig;
  }

  private removeFieldFromSelect(item: {
    newMconfig: MconfigX;
    fieldId: string;
  }) {
    let { newMconfig, fieldId } = item;

    let fieldIndex = newMconfig.select.findIndex(x => x === fieldId);

    newMconfig.select = [
      ...newMconfig.select.slice(0, fieldIndex),
      ...newMconfig.select.slice(fieldIndex + 1)
    ];

    return newMconfig;
  }

  private removeFieldFromSortings(item: {
    newMconfig: MconfigX;
    fieldId: string;
  }) {
    let { newMconfig, fieldId } = item;

    let fIndex = newMconfig.sortings.findIndex(x => x.fieldId === fieldId);

    if (fIndex > -1) {
      newMconfig.sortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];

      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc === true
          ? newSorts.push(`${sorting.fieldId} desc`)
          : newSorts.push(sorting.fieldId)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;
    }

    return newMconfig;
  }

  removeFieldFromChart(item: { newMconfig: MconfigX; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    if (newMconfig.chart.xField === fieldId) {
      newMconfig.chart.xField = null;
    }

    if (newMconfig.chart.multiField === fieldId) {
      newMconfig.chart.multiField = null;
    }

    if (newMconfig.chart.yFields.length > 0) {
      let index = newMconfig.chart.yFields.findIndex(yId => yId === fieldId);

      if (index > -1) {
        newMconfig.chart.yFields = [
          ...newMconfig.chart.yFields.slice(0, index),
          ...newMconfig.chart.yFields.slice(index + 1)
        ];
      }
    }

    // if (newMconfig.chart.hideColumns.length > 0) {
    //   let index = newMconfig.chart.hideColumns.findIndex(
    //     hId => hId === fieldId
    //   );

    //   if (index > -1) {
    //     newMconfig.chart.hideColumns = [
    //       ...newMconfig.chart.hideColumns.slice(0, index),
    //       ...newMconfig.chart.hideColumns.slice(index + 1)
    //     ];
    //   }
    // }

    return newMconfig;
  }
}
