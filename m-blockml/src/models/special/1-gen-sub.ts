import { barSub } from '../../barrels/bar-sub';
import { interfaces } from '../../barrels/interfaces';

export function genSub(item: { select: string[]; view: interfaces.View }) {
  let { select, view } = item;

  let varsSubElements: interfaces.ViewPart['varsSubElements'] = [];

  let { depMeasures, depDimensions } = barSub.subMakeDepMeasuresAndDimensions({
    select: select,
    varsSubElements: varsSubElements,
    view: view
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
    varsSubElements: varsSubElements,
    view: view
  });

  let { needsAll } = barSub.subMakeNeedsAll({
    selected: selected,
    varsSubElements: varsSubElements,
    view: view
  });

  let { contents, myWith } = barSub.subMakeContents({
    needsAll: needsAll,
    varsSubElements: varsSubElements,
    view: view
  });

  let { mainQuery } = barSub.subComposeMain({
    mainText: mainText,
    contents: contents,
    groupMainBy: groupMainBy,
    myWith: myWith,
    varsSubElements: varsSubElements
  });

  let { calcQuery } = barSub.subComposeCalc({
    select: select,
    processedFields: processedFields,
    mainQuery: mainQuery,
    varsSubElements: varsSubElements,
    view: view
  });

  return { calcQuery, extraUdfs, varsSubElements };
}
