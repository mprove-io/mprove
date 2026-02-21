import {
  PATH_BUILDER,
  PATH_CHART,
  PATH_CHARTS_LIST,
  PATH_DASHBOARD,
  PATH_DASHBOARDS,
  PATH_DASHBOARDS_LIST,
  PATH_MODEL,
  PATH_MODELS,
  PATH_MODELS_LIST,
  PATH_REPORT,
  PATH_REPORTS,
  PATH_REPORTS_LIST
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';

export function checkNavMain(item: {
  navArray: string[];
  urlParts: string[];
  lastDashboardId?: string;
  lastModelId?: string;
  lastChartId?: string;
  lastReportId?: string;
}) {
  let {
    navArray,
    urlParts,
    lastDashboardId,
    lastModelId,
    lastChartId,
    lastReportId
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
  } else {
    nextNavAr.push(PATH_BUILDER);
  }

  return nextNavAr;
}
