import { Injectable } from '@angular/core';
import { isNumeric } from 'rxjs/internal/util/isNumeric';
import * as api from 'app/api/_index';

@Injectable()
export class DataService {
  constructor() {}

  getValueData(
    selectFields: api.ModelField[],
    data: any[],
    currentValueFieldId: string,
    previousValueFieldId: string
  ) {
    if (selectFields && data && data.length > 0 && currentValueFieldId) {
      let currentValueField = selectFields.find(
        f => f.id === currentValueFieldId
      );

      if (!currentValueField) {
        return [0, 0];
      }

      let currentValueName = currentValueField.sql_name;
      let currentValue = isNumeric(data[0][currentValueName])
        ? data[0][currentValueName]
        : 0;

      let previousValueField;

      previousValueField = selectFields.find(
        f => f.id === previousValueFieldId
      );

      if (!previousValueField) {
        return [currentValue, 0];
      }

      let previousValueName = previousValueField.sql_name;

      let previousValue = isNumeric(data[0][previousValueName])
        ? data[0][previousValueName]
        : 0;

      return [currentValue, previousValue];
    } else {
      return [0, 0];
    }
  }

  getSingleData(
    selectFields: api.ModelField[],
    data: any[],
    xFieldId: string,
    yFieldId: string
  ) {
    if (selectFields && data && data.length > 0 && xFieldId && yFieldId) {
      let xField = selectFields.find(f => f.id === xFieldId);
      let yField = selectFields.find(f => f.id === yFieldId);

      if (!xField || !yField) {
        return [];
      }

      let xName = xField.sql_name;
      let yName = yField.sql_name;

      let singleData = data
        ? data.map((raw: any) =>
            Object.assign({
              name: raw[xName] ? raw[xName] : 'null',
              value: isNumeric(raw[yName]) ? raw[yName] : 0
            })
          )
        : [];

      return singleData;
    } else {
      return [];
    }
  }

  getSingleDataForNumberCard(item: {
    selectFields: api.ModelField[];
    data: any[];
    xFieldId: string;
    yFieldId: string;
  }) {
    if (
      item.selectFields &&
      item.data &&
      item.data.length > 0 &&
      item.yFieldId
    ) {
      let xField = item.xFieldId
        ? item.selectFields.find(f => f.id === item.xFieldId)
        : undefined;

      let yField = item.selectFields.find(f => f.id === item.yFieldId);

      if (!yField) {
        return [];
      }

      let xName = xField ? xField.sql_name : undefined;
      let yName = yField.sql_name;

      let singleData = item.data
        ? item.data.map((raw: any) =>
            Object.assign({
              name: !xName ? ' ' : raw[xName] ? raw[xName] : 'null',
              value: isNumeric(raw[yName]) ? raw[yName] : 0
            })
          )
        : [];

      return singleData;
    } else {
      return [];
    }
  }

  getMultiData(
    selectFields: api.ModelField[],
    data: any[],
    multiFieldId: string,
    xFieldId: string,
    yFieldsIds: string[]
  ) {
    if (
      selectFields &&
      data &&
      data.length > 0 &&
      xFieldId &&
      yFieldsIds.length > 0
    ) {
      let xField = selectFields.find(f => f.id === xFieldId);

      if (!xField) {
        return [];
      }

      let yFields: api.ModelField[] = [];

      yFieldsIds.forEach(yFieldId => {
        let yField = selectFields.find(f => f.id === yFieldId);

        if (!yField) {
          return [];
        }

        yFields.push(yField);
      });

      let xName = xField.sql_name;
      let xValue = this.getValue(xName);

      let multiField = multiFieldId
        ? selectFields.find(f => f.id === multiFieldId)
        : undefined;

      if (multiFieldId && !multiField) {
        return [];
      }

      let multiName = multiField ? multiField.sql_name : undefined;

      let prepareData: any = {};

      data.forEach((raw: any) => {
        yFields.forEach(yField => {
          let yName = yField.sql_name;

          let key: string;

          if (multiName) {
            if (yFields.length > 1) {
              key = raw[multiName]
                ? raw[multiName] + ' ' + yField.label
                : 'null' + ' ' + yField.label;
            } else {
              key = raw[multiName] ? raw[multiName] : 'null';
            }
          } else {
            key = yField.label;
          }

          // x null check
          if (raw[xName]) {
            let element = {
              name: xValue(raw, xName),
              value: isNumeric(raw[yName]) ? raw[yName] : 0
            };

            if (prepareData[key]) {
              prepareData[key].push(element);
            } else {
              prepareData[key] = [element];
            }
          }
        });
      });

      let multiData: any[] = Object.keys(prepareData).map(x =>
        Object.assign({
          name: x,
          series: prepareData[x]
        })
      );

      return multiData;
    } else {
      return [];
    }
  }

  private getValue(fieldName: string) {
    let fieldValue: any;

    if (fieldName.match(/(?:___date)$/g)) {
      fieldValue = this.getDateFromDate;
    } else if (fieldName.match(/(?:___hour)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour2)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour3)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour4)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour6)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour8)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___hour12)$/g)) {
      fieldValue = this.getDateFromHour;
    } else if (fieldName.match(/(?:___minute)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute2)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute3)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute5)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute10)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute15)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___minute30)$/g)) {
      fieldValue = this.getDateFromMinute;
    } else if (fieldName.match(/(?:___month)$/g)) {
      fieldValue = this.getDateFromMonth;
    } else if (fieldName.match(/(?:___quarter)$/g)) {
      fieldValue = this.getDateFromQuarter;
    } else if (fieldName.match(/(?:___time)$/g)) {
      fieldValue = this.getDateFromTime;
    } else if (fieldName.match(/(?:___week)$/g)) {
      fieldValue = this.getDateFromWeek;
    } else if (fieldName.match(/(?:___year)$/g)) {
      fieldValue = this.getDateFromYear;
    } else {
      fieldValue = this.getRawValue;
    }

    return fieldValue;
  }

  private getDateFromDate(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let [full, year, month, day] = regEx.exec(data);

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );

    return date;
  }

  private getDateFromHour(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)$/g;

    let [full, year, month, day, hour] = regEx.exec(data);

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10)
    );

    return date;
  }

  private getDateFromMinute(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d).+$/g;

    let [full, year, month, day, hour, minute] = regEx.exec(data);

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10)
    );

    return date;
  }

  private getDateFromMonth(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let [full, year, month] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromQuarter(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let [full, year, month] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromTime(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)[:](\d\d)$/g;

    let [full, year, month, day, hour, minute, second] = regEx.exec(data);

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );

    return date;
  }

  private getDateFromWeek(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let [full, year, month] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromYear(raw: any, fieldName: string) {
    let data = raw[fieldName];

    let regEx = /(\d\d\d\d)$/g;

    let [full, year] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), 0, 1);

    return date;
  }

  private getRawValue(raw: any, fieldName: string) {
    return raw[fieldName];
  }
}
