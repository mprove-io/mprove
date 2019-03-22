import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  transform(arr: any[], groupKey: any) {
    if (!groupKey) {
      return arr;
    }
    const groupMap = new Map();
    arr.forEach(value => {
      const key = value[groupKey];
      if (!key) {
        return arr;
      }
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
