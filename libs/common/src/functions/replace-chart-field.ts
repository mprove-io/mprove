import { FieldResultEnum } from '~common/enums/field-result.enum';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { isDefined } from './is-defined';

export function replaceChartField<T extends Mconfig>(item: {
  mconfig: T;
  currentFieldId: string;
  newColumnFieldId: string;
  newFieldResult: FieldResultEnum;
}) {
  let { mconfig, currentFieldId, newColumnFieldId, newFieldResult } = item;

  if (mconfig.chart.xField === currentFieldId) {
    mconfig.chart.xField = newColumnFieldId;
  }

  if (mconfig.chart.multiField === currentFieldId) {
    mconfig.chart.multiField = newColumnFieldId;
  }

  if (mconfig.chart.sizeField === currentFieldId) {
    mconfig.chart.sizeField =
      newFieldResult === FieldResultEnum.Number ? newColumnFieldId : undefined;
  }

  if (isDefined(mconfig.chart.yFields)) {
    let yFieldsIndex = mconfig.chart.yFields.indexOf(currentFieldId);

    if (yFieldsIndex > -1) {
      if (newFieldResult === FieldResultEnum.Number) {
        mconfig.chart.yFields.splice(yFieldsIndex, 1, newColumnFieldId);
      } else {
        mconfig.chart.yFields = mconfig.chart.yFields.filter(
          yFieldId => yFieldId !== currentFieldId
        );
      }
    }
  }

  if (isDefined(mconfig.chart.hideColumns)) {
    let hideColumnsIndex = mconfig.chart.hideColumns.indexOf(currentFieldId);

    if (hideColumnsIndex > -1) {
      mconfig.chart.hideColumns.splice(hideColumnsIndex, 1, newColumnFieldId);
    }
  }

  if (isDefined(mconfig.chart.series)) {
    let se = mconfig.chart.series.find(x => x.dataField === currentFieldId);

    if (isDefined(se)) {
      if (newFieldResult === FieldResultEnum.Number) {
        se.dataField = newColumnFieldId;
      } else {
        mconfig.chart.series = mconfig.chart.series.filter(
          s => s.dataField !== currentFieldId
        );
      }
    }
  }

  return mconfig;
}
