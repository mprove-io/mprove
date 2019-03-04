import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  transform(arr: any[], groupKey: any) {
    if (!groupKey) {
      return arr;
    } // fast return if groupKey is undefined
    const groupMap = new Map();
    arr.forEach(value => {
      const key = value[groupKey];
      if (!key) {
        return arr;
      } // fast return if value of key is undefined
      const subArray = groupMap.get(key);
      if (subArray) {
        groupMap.set(key, [value, ...subArray]);
      } else {
        groupMap.set(key, [value]);
      }
    });

    return Array.from(groupMap);
  }
}
