import { barSub } from '../../barrels/bar-sub';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';

export function genSub(item: {
  select: string[];
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  view: interfaces.View;
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { select, varsSubArray, view, views, errors, structId, caller } = item;

  let { depMeasures, depDimensions } = barSub.subMakeDepMeasuresAndDimensions({
    select: select,
    varsSubArray: varsSubArray,
    view: view,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  let {
    mainText,
    groupMainBy,
    mainFields,
    selected,
    processedFields,
    extraUdfs
  } = barSub.subMakeMainFields({
    select: select,
    depMeasures: depMeasures,
    depDimensions: depDimensions,
    varsSubArray: varsSubArray,
    view: view,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  let { needsAll } = barSub.subMakeNeedsAll({
    selected: selected,
    varsSubArray: varsSubArray,
    view: view,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  let { contents, myWith } = barSub.subMakeContents({
    needsAll: needsAll,
    varsSubArray: varsSubArray,
    view: view,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  let { mainQuery } = barSub.subComposeMain({
    mainText: mainText,
    contents: contents,
    groupMainBy: groupMainBy,
    myWith: myWith,
    varsSubArray: varsSubArray,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  let { calcQuery } = barSub.subComposeCalc({
    select: select,
    processedFields: processedFields,
    mainQuery: mainQuery,
    varsSubArray: varsSubArray,
    view: view,
    views: views,
    errors: errors,
    structId: structId,
    caller: caller
  });

  return { calcQuery, extraUdfs };
}
