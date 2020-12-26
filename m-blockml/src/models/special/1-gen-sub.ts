import { barSub } from '../../barrels/bar-sub';
import { interfaces } from '../../barrels/interfaces';

export function genSub(item: { select: string[]; view: interfaces.View }) {
  let { select, view } = item;

  let varsSubSteps: interfaces.ViewPart['varsSubSteps'] = [];

  let { depMeasures, depDimensions } = barSub.subMakeDepMeasuresAndDimensions({
    select,
    varsSubSteps,
    view
  });

  let {
    mainText,
    groupMainBy,
    selected,
    processedFields,
    extraUdfs
  } = barSub.subMakeMainText({
    select,
    depMeasures,
    depDimensions,
    varsSubSteps,
    view
  });

  let { needsAll } = barSub.subMakeNeedsAll({
    selected,
    varsSubSteps,
    view
  });

  let { contents, myWith } = barSub.subMakeContents({
    needsAll,
    varsSubSteps,
    view
  });

  let { mainQuery } = barSub.subComposeMain({
    mainText,
    contents,
    groupMainBy,
    myWith,
    varsSubSteps,
    view
  });

  let { sub } = barSub.subComposeCalc({
    select,
    processedFields,
    mainQuery,
    varsSubSteps,
    view
  });

  return { sub, extraUdfs, varsSubSteps };
}
