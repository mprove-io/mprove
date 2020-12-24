import { barSub } from '../../barrels/bar-sub';
import { interfaces } from '../../barrels/interfaces';

export function genSub(item: { select: string[]; view: interfaces.View }) {
  let { select, view } = item;

  let varsSubSteps: interfaces.ViewPart['varsSubSteps'] = [];

  let { depMeasures, depDimensions } = barSub.subMakeDepMeasuresAndDimensions({
    select: select,
    varsSubSteps: varsSubSteps,
    view: view
  });

  let {
    mainText,
    groupMainBy,
    selected,
    processedFields,
    extraUdfs,
    mainFields
  } = barSub.subMakeMainFields({
    select: select,
    depMeasures: depMeasures,
    depDimensions: depDimensions,
    varsSubSteps: varsSubSteps,
    view: view
  });

  let { needsAll } = barSub.subMakeNeedsAll({
    selected: selected,
    varsSubSteps: varsSubSteps,
    view: view
  });

  let { contents, myWith } = barSub.subMakeContents({
    needsAll: needsAll,
    varsSubSteps: varsSubSteps,
    view: view
  });

  let { mainQuery } = barSub.subComposeMain({
    mainText: mainText,
    contents: contents,
    groupMainBy: groupMainBy,
    myWith: myWith,
    varsSubSteps: varsSubSteps
  });

  let { sub } = barSub.subComposeCalc({
    select: select,
    processedFields: processedFields,
    mainQuery: mainQuery,
    varsSubSteps: varsSubSteps,
    view: view
  });

  return { sub, extraUdfs, varsSubSteps };
}
