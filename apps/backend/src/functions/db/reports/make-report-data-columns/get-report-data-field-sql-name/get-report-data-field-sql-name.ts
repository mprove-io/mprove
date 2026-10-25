import { DOUBLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MconfigField } from '#common/types/backend/parts/mconfig/mconfig-field';
import type { Row } from '#common/types/blockml/parts/report/row/row';

export function getReportDataFieldSqlName(item: {
  row: Row;
  selectIndex: number;
}): string {
  let { row, selectIndex } = item;

  let fieldId = row.mconfig?.select[selectIndex];

  let mconfigField: MconfigField = row.mconfig?.fields.find(
    field => field.id === fieldId
  );

  let fallbackSqlName: string =
    row.mconfig?.modelType === 'Malloy'
      ? fieldId?.split('.').join(DOUBLE_UNDERSCORE)
      : fieldId?.split('.').join('_');

  let sqlName = isDefined(mconfigField?.sqlName)
    ? mconfigField.sqlName
    : fallbackSqlName;

  let normalizedSqlName: string = sqlName?.toLowerCase();

  return normalizedSqlName;
}
