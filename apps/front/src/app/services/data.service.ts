import { Injectable } from '@angular/core';
import { isNumeric } from 'rxjs/internal/util/isNumeric';
import { capitalizeFirstLetter } from '~common/_index';
import { common } from '~front/barrels/common';
import { ColumnField } from '../queries/mq.query';
import { RData } from './query.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor() {}

  getValueData(item: {
    columnFields: ColumnField[];
    data: RData[];
    currentValueFieldId: string;
    previousValueFieldId: string;
  }) {
    let {
      columnFields,
      data,
      currentValueFieldId,
      previousValueFieldId
    } = item;

    let currentValueField = columnFields.find(
      f => f.id === currentValueFieldId
    );

    let currentValueName = currentValueField.sqlName;

    let currentValue = isNumeric(data[0][currentValueName].value)
      ? Number(data[0][currentValueName].value)
      : 0;

    let previousValueField;

    previousValueField = columnFields.find(f => f.id === previousValueFieldId);

    if (!previousValueField) {
      return [currentValue, 0];
    }

    let previousValueName = previousValueField.sqlName;

    let previousValue = isNumeric(data[0][previousValueName].value)
      ? Number(data[0][previousValueName].value)
      : 0;

    return [currentValue, previousValue];
  }

  getSingleData(item: {
    selectFields: ColumnField[];
    data: RData[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = selectFields.find(f => f.id === xFieldId);
    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = xField.sqlName;
    let yName = yField.sqlName;

    let singleData = data.map((raw: RData) => ({
      name: common.isDefined(raw[xName].value) ? raw[xName].value : 'null',
      value: isNumeric(raw[yName].value) ? Number(raw[yName].value) : 0
    }));

    // console.log(singleData);

    return singleData;
  }

  getSingleDataForNumberCard(item: {
    selectFields: ColumnField[];
    data: any[];
    xFieldId: string;
    yFieldId: string;
  }) {
    let { selectFields, data, xFieldId, yFieldId } = item;

    let xField = xFieldId
      ? selectFields.find(f => f.id === xFieldId)
      : undefined;

    let yField = selectFields.find(f => f.id === yFieldId);

    let xName = common.isDefined(xField) ? xField.sqlName : undefined;
    let yName = yField.sqlName;

    let singleData = data
      ? data.map((raw: RData) =>
          Object.assign({
            name: common.isDefined(xField) ? raw[xName].value || 'null' : ' ',
            value: isNumeric(raw[yName].value) ? Number(raw[yName].value) : 0
          })
        )
      : [];

    return singleData;
  }

  getMultiData(item: {
    selectFields: ColumnField[];
    data: any[];
    multiFieldId: string;
    xFieldId: string;
    yFieldsIds: string[];
  }) {
    // console.log(item);

    let xField = item.selectFields.find(f => f.id === item.xFieldId);

    if (!xField) {
      return [];
    }

    let yFields: ColumnField[] = [];

    item.yFieldsIds.forEach(yFieldId => {
      let yField = item.selectFields.find(f => f.id === yFieldId);

      if (!yField) {
        return [];
      }

      yFields.push(yField);
    });

    let xName = xField.sqlName;
    let xValue = this.getValue(xName);

    let multiField = item.multiFieldId
      ? item.selectFields.find(f => f.id === item.multiFieldId)
      : undefined;

    if (item.multiFieldId && !multiField) {
      return [];
    }

    let multiName = multiField ? multiField.sqlName : undefined;

    let prepareData: any = {};

    item.data.forEach((raw: RData) => {
      yFields.forEach(yField => {
        let yName = yField.sqlName;

        let key: string;

        let yLabel =
          yField.topLabel +
          (common.isDefined(yField.groupLabel)
            ? ` ${capitalizeFirstLetter(yField.groupLabel)}`
            : '') +
          ` ${capitalizeFirstLetter(yField.label)}`;

        if (multiName) {
          if (yFields.length > 1) {
            key = raw[multiName].value
              ? raw[multiName].value + ' ' + yLabel
              : 'null' + ' ' + yLabel;
          } else {
            key = raw[multiName].value ? raw[multiName].value : 'null';
          }
        } else {
          key = yLabel;
        }

        // x null check
        if (raw[xName]) {
          let xV = xValue(raw, xName);
          let yV = raw[yName].value;

          let element = {
            name: isNumeric(xV) ? Number(xV) : xV,
            value: isNumeric(yV) ? Number(yV) : 0
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
    let data = raw[fieldName].value;

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
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)$/g;

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
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)\s(\d\d)[:](\d\d)$/g;

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
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let [full, year, month] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromQuarter(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)$/g;

    let [full, year, month] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return date;
  }

  private getDateFromTime(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

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
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)[-](\d\d)[-](\d\d)$/g;

    let [full, year, month, day] = regEx.exec(data);

    let date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );

    return date;
  }

  private getDateFromYear(raw: any, fieldName: string) {
    let data = raw[fieldName].value;

    let regEx = /(\d\d\d\d)$/g;

    let [full, year] = regEx.exec(data);

    let date = new Date(parseInt(year, 10), 0, 1);

    return date;
  }

  private getRawValue(raw: any, fieldName: string) {
    return raw[fieldName].value;
  }
}
