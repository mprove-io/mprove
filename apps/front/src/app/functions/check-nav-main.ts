import {
  PATH_BUILDER,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_EXPLORER,
  PATH_FILE,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_NEW_SESSION,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST,
  PATH_SELECT_FILE,
  PATH_SESSION
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';

export function checkNavMain(item: {
  navArray: string[];
  urlParts: string[];
  lastDashboardId?: string;
  lastModelId?: string;
  lastChartId?: string;
  lastReportId?: string;
  fileId?: string;
}) {
  let {
    navArray,
    urlParts,
    lastDashboardId,
    lastModelId,
    lastChartId,
    lastReportId,
    fileId
  } = item;

  let nextNavAr = [...navArray];

  if (urlParts[11] === PATH_MODELS) {
    nextNavAr.push(PATH_MODELS);
    if (urlParts[12] === PATH_CHARTS_LIST) {
      nextNavAr.push(PATH_CHARTS_LIST);
    } else if (urlParts[12] === PATH_MODELS_LIST) {
      nextNavAr.push(PATH_MODELS_LIST);
    } else if (urlParts[12] === PATH_MODEL) {
      if (isDefined(lastModelId)) {
        nextNavAr.push(PATH_MODEL);
        nextNavAr.push(lastModelId);
        if (urlParts[14] === PATH_CHARTS_LIST) {
          nextNavAr.push(PATH_CHARTS_LIST);
        } else if (urlParts[14] === PATH_MODELS_LIST) {
          nextNavAr.push(PATH_MODELS_LIST);
        } else if (urlParts[14] === PATH_CHART) {
          if (isDefined(lastChartId)) {
            nextNavAr.push(PATH_CHART);
            nextNavAr.push(lastChartId);
          } else {
            nextNavAr.push(PATH_CHARTS_LIST);
          }
        }
      } else {
        nextNavAr.push(PATH_MODELS_LIST);
      }
    }
  } else if (urlParts[11] === PATH_DASHBOARDS) {
    nextNavAr.push(PATH_DASHBOARDS);
    if (urlParts[12] === PATH_DASHBOARDS_LIST) {
      nextNavAr.push(PATH_DASHBOARDS_LIST);
    } else if (isDefined(lastDashboardId)) {
      nextNavAr.push(PATH_DASHBOARD);
      nextNavAr.push(lastDashboardId);
    } else {
      nextNavAr.push(PATH_DASHBOARDS_LIST);
    }
  } else if (urlParts[11] === PATH_REPORTS) {
    nextNavAr.push(PATH_REPORTS);
    if (urlParts[12] === PATH_REPORTS_LIST) {
      nextNavAr.push(PATH_REPORTS_LIST);
    } else if (isDefined(lastReportId)) {
      nextNavAr.push(PATH_REPORT);
      nextNavAr.push(lastReportId);
    } else {
      nextNavAr.push(PATH_REPORTS_LIST);
    }
  } else if (urlParts[11] === PATH_EXPLORER) {
    nextNavAr.push(PATH_EXPLORER);
    nextNavAr.push(PATH_NEW_SESSION);
  } else {
    nextNavAr.push(PATH_BUILDER);
    if (urlParts[12] === PATH_FILE && isDefined(fileId)) {
      nextNavAr.push(PATH_FILE);
      nextNavAr.push(fileId);
    } else if (urlParts[12] === PATH_SESSION && isDefined(urlParts[13])) {
      nextNavAr.push(PATH_SESSION);
      nextNavAr.push(urlParts[13]);
    } else if (urlParts[12] === PATH_SELECT_FILE) {
      nextNavAr.push(PATH_SELECT_FILE);
    } else if (urlParts[12] === PATH_NEW_SESSION) {
      nextNavAr.push(PATH_NEW_SESSION);
    }
  }

  return nextNavAr;
}
