import { barSub } from '~blockml/barrels/bar-sub';
import { interfaces } from '~blockml/barrels/interfaces';

export function genSub(item: {
  select: string[];
  view: interfaces.View;
  viewPartName: string;
}) {
  let { select, view, viewPartName } = item;

  select = [...select].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

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

  let { myWith } = barSub.subMakeWith({
    needsAll,
    varsSubSteps,
    view
  });

  let { mainQuery } = barSub.subComposeMain({
    myWith,
    mainText,
    groupMainBy,
    varsSubSteps,
    view
  });

  let { sub } = barSub.subComposeCalc({
    select,
    processedFields,
    mainQuery,
    varsSubSteps,
    view,
    viewPartName
  });

  return { sub, extraUdfs, varsSubSteps };
}
