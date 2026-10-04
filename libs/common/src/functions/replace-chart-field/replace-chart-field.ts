import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';

export function replaceChartField<T extends Mconfig>(item: {
  mconfig: T;
  currentFieldId: string;
  newColumnFieldId: string;
  newFieldResult: FieldResult;
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
      newFieldResult === 'number' ? newColumnFieldId : undefined;
  }

  if (isDefined(mconfig.chart.yFields)) {
    let yFieldsIndex = mconfig.chart.yFields.indexOf(currentFieldId);

    if (yFieldsIndex > -1) {
      if (newFieldResult === 'number') {
        mconfig.chart.yFields.splice(yFieldsIndex, 1, newColumnFieldId);
      } else {
        mconfig.chart.yFields = mconfig.chart.yFields.filter(
          yFieldId => yFieldId !== currentFieldId
        );
      }
    }
  }

  if (isDefined(mconfig.chart.series)) {
    let se = mconfig.chart.series.find(x => x.dataField === currentFieldId);

    if (isDefined(se)) {
      if (newFieldResult === 'number') {
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
