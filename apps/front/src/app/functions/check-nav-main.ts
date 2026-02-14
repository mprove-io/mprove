import {
  LAST_SELECTED_CHART_ID,
  LAST_SELECTED_DASHBOARD_ID,
  LAST_SELECTED_FILE_ID,
  LAST_SELECTED_MODEL_ID,
  LAST_SELECTED_REPORT_ID,
  PATH_BUILDER,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_FILE,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST
} from '#common/constants/top';

export function checkNavMain(item: { navArray: string[]; urlParts: string[] }) {
  let { navArray, urlParts } = item;

  let nextNavAr = [...navArray];

  if (urlParts[11] === PATH_BUILDER) {
    nextNavAr.push(PATH_BUILDER);
    nextNavAr.push(PATH_FILE);
    nextNavAr.push(LAST_SELECTED_FILE_ID);
  } else if (urlParts[11] === PATH_MODELS) {
    nextNavAr.push(PATH_MODELS);
    if (urlParts[12] === PATH_CHARTS_LIST) {
      nextNavAr.push(PATH_CHARTS_LIST);
    } else if (urlParts[12] === PATH_MODELS_LIST) {
      nextNavAr.push(PATH_MODELS_LIST);
    } else if (urlParts[12] === PATH_MODEL) {
      nextNavAr.push(PATH_MODEL);
      nextNavAr.push(LAST_SELECTED_MODEL_ID);
      if (urlParts[14] === PATH_CHARTS_LIST) {
        nextNavAr.push(PATH_CHARTS_LIST);
      } else if (urlParts[14] === PATH_MODELS_LIST) {
        nextNavAr.push(PATH_MODELS_LIST);
      } else if (urlParts[14] === PATH_CHART) {
        nextNavAr.push(PATH_CHART);
        nextNavAr.push(LAST_SELECTED_CHART_ID);
      }
    }
  } else if (urlParts[11] === PATH_DASHBOARDS) {
    nextNavAr.push(PATH_DASHBOARDS);
    if (urlParts[12] === PATH_DASHBOARDS_LIST) {
      nextNavAr.push(PATH_DASHBOARDS_LIST);
    } else {
      nextNavAr.push(PATH_DASHBOARD);
      nextNavAr.push(LAST_SELECTED_DASHBOARD_ID);
    }
  } else if (urlParts[11] === PATH_REPORTS) {
    nextNavAr.push(PATH_REPORTS);
    if (urlParts[12] === PATH_REPORTS_LIST) {
      nextNavAr.push(PATH_REPORTS_LIST);
    } else {
      nextNavAr.push(PATH_REPORT);
      nextNavAr.push(LAST_SELECTED_REPORT_ID);
    }
  } else {
    nextNavAr.push(PATH_BUILDER);
  }

  return nextNavAr;
}
