import { common } from '~front/barrels/common';

export function checkNavMain(item: {
  navArray: string[];
  urlParts: string[];
}) {
  let { navArray, urlParts } = item;

  let nextNavAr = [...navArray];

  if (urlParts[11] === common.PATH_FILES) {
    nextNavAr.push(common.PATH_FILES);
    nextNavAr.push(common.PATH_FILE);
    nextNavAr.push(common.LAST_SELECTED_FILE_ID);
  } else if (urlParts[11] === common.PATH_MODELS) {
    nextNavAr.push(common.PATH_MODELS);
    if (urlParts[12] === common.PATH_CHARTS_LIST) {
      nextNavAr.push(common.PATH_CHARTS_LIST);
    } else if (urlParts[12] === common.PATH_MODELS_LIST) {
      nextNavAr.push(common.PATH_MODELS_LIST);
    } else if (urlParts[12] === common.PATH_MODEL) {
      nextNavAr.push(common.PATH_MODEL);
      nextNavAr.push(common.LAST_SELECTED_MODEL_ID);
      if (urlParts[14] === common.PATH_CHARTS_LIST) {
        nextNavAr.push(common.PATH_CHARTS_LIST);
      } else if (urlParts[14] === common.PATH_MODELS_LIST) {
        nextNavAr.push(common.PATH_MODELS_LIST);
      } else if (urlParts[14] === common.PATH_CHART) {
        nextNavAr.push(common.PATH_CHART);
        nextNavAr.push(common.LAST_SELECTED_CHART_ID);
      }
    }
  } else if (urlParts[11] === common.PATH_DASHBOARDS) {
    nextNavAr.push(common.PATH_DASHBOARDS);
    if (urlParts[12] === common.PATH_DASHBOARDS_LIST) {
      nextNavAr.push(common.PATH_DASHBOARDS_LIST);
    } else {
      nextNavAr.push(common.PATH_DASHBOARD);
      nextNavAr.push(common.LAST_SELECTED_DASHBOARD_ID);
    }
  } else if (urlParts[11] === common.PATH_REPORTS) {
    nextNavAr.push(common.PATH_REPORTS);
    if (urlParts[12] === common.PATH_REPORTS_LIST) {
      nextNavAr.push(common.PATH_REPORTS_LIST);
    } else {
      nextNavAr.push(common.PATH_REPORT);
      nextNavAr.push(common.LAST_SELECTED_REPORT_ID);
    }
  } else {
    nextNavAr.push(common.PATH_FILES);
  }

  return nextNavAr;
}
