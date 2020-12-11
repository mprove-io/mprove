import { barSub } from '../../barrels/bar-sub';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function genSub(item: {
  view: interfaces.View;
  select: string[];
  udfsDict: api.UdfsDict;
  weekStart: api.ProjectWeekStartEnum;
  connection: api.ProjectConnection;
  projectId: string;
  structId: string;
}) {
  let vars: interfaces.VarsSub = {
    view: item.view,
    select: item.select,
    weekStart: item.weekStart,
    connection: item.connection,
    projectId: item.projectId,
    structId: item.structId,
    udfsDict: item.udfsDict,
    depMeasures: undefined,
    depDimensions: undefined,
    mainText: undefined,
    groupMainBy: undefined,
    mainFields: undefined,
    selected: undefined,
    processedFields: undefined,
    extraUdfs: {},
    needsAll: undefined,
    contents: undefined,
    with: undefined,
    query: undefined,
    calcQuery: undefined
  };

  // view
  // select
  //    depMeasures
  vars = barSub.makeDepMeasuresAndDimensions(vars);

  // view
  // depMeasures
  // select
  //    mainText
  //    groupMainBy
  //    mainFields
  //    selected
  //    processedFields
  //    extraUdfs
  vars = barSub.makeMainFields(vars);

  // view
  // selected
  //    needsAll
  vars = barSub.makeNeedsAll(vars);

  // view
  // needsAll
  // bqProject
  // projectId
  // structId
  //    contents
  //    with
  vars = barSub.makeContents(vars);

  // view
  // mainText
  // contents
  // groupMainBy
  // with
  //    query
  vars = barSub.composeMain(vars);

  // query
  // timezone
  //    query
  // vars = barSub.processTimezone(vars);

  // view
  // select
  // processedFields
  // query
  //    calcQuery
  vars = barSub.composeCalc(vars);

  return { query: vars.calcQuery, extraUdfs: vars.extraUdfs };
}
