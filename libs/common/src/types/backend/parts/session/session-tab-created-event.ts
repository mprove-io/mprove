import type { SESSION_TAB_CREATED_EVENT_TYPE } from '#common/constants/top';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

export type SessionTabCreatedEventProperties = {
  tabId: string;
  chartId: string;
  chartType: ChartType;
  title: string;
  modelId: string;
};

export type SessionTabCreatedEvent = {
  id: string;
  type: typeof SESSION_TAB_CREATED_EVENT_TYPE;
  properties: SessionTabCreatedEventProperties;
};
