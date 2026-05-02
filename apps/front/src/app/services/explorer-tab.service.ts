import { Injectable } from '@angular/core';
import { interval, type Subscription } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendOpenExplorerChartTabRequestPayload,
  ToBackendOpenExplorerChartTabResponse
} from '#common/zod/to-backend/explorer/to-backend-open-explorer-chart-tab';
import type { ToBackendCloseExplorerSessionTabRequestPayload } from '#common/zod/to-backend/sessions/to-backend-close-explorer-session-tab';
import { ExplorerTabsQuery } from '#front/app/queries/explorer-tabs.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { ApiService } from '#front/app/services/api.service';

@Injectable({ providedIn: 'root' })
export class ExplorerTabService {
  private pollingByTabId = new Map<string, Subscription>();

  constructor(
    private apiService: ApiService,
    private explorerTabsQuery: ExplorerTabsQuery,
    private sessionQuery: SessionQuery
  ) {}

  openTab(item: { sessionId: string; tabId: string; chartId: string }) {
    let { sessionId, tabId, chartId } = item;

    let loadingStartedAt = Date.now();

    this.stopPolling({ tabId: tabId });

    this.explorerTabsQuery.setContent({
      tabId: tabId,
      content: { status: 'loading' }
    });

    let payload: ToBackendOpenExplorerChartTabRequestPayload = {
      sessionId: sessionId,
      chartId: chartId
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendOpenExplorerChartTab,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendOpenExplorerChartTabResponse) => {
          let elapsed = Date.now() - loadingStartedAt;
          let delayMs = Math.max(0, 150 - elapsed);

          setTimeout(() => {
            this.setTabPayload({
              sessionId: sessionId,
              tabId: tabId,
              chartId: chartId,
              respPayload: resp.payload
            });
          }, delayMs);
        })
      )
      .subscribe();
  }

  closeTab(item: { sessionId: string; tabId: string }) {
    let closedExplorerTabIds = this.explorerTabsQuery.closeTab({
      tabId: item.tabId
    });

    this.persistClosedTabs({
      sessionId: item.sessionId,
      closedExplorerTabIds: closedExplorerTabIds
    });
  }

  reopenTab(item: { sessionId: string; tabId: string }) {
    let closedExplorerTabIds = this.explorerTabsQuery.reopenTab({
      tabId: item.tabId
    });

    this.persistClosedTabs({
      sessionId: item.sessionId,
      closedExplorerTabIds: closedExplorerTabIds
    });
  }

  private persistClosedTabs(item: {
    sessionId: string;
    closedExplorerTabIds: string[];
  }) {
    let payload: ToBackendCloseExplorerSessionTabRequestPayload = {
      sessionId: item.sessionId,
      closedExplorerTabIds: item.closedExplorerTabIds
    };

    let session = this.sessionQuery.getValue();
    if (session?.sessionId === item.sessionId) {
      this.sessionQuery.updatePart({
        closedExplorerTabIds: item.closedExplorerTabIds
      });
    }

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendCloseExplorerSessionTab,
        payload: payload
      })
      .subscribe();
  }

  private setTabPayload(item: {
    sessionId: string;
    tabId: string;
    chartId: string;
    respPayload: ToBackendOpenExplorerChartTabResponse['payload'];
  }) {
    let { sessionId, tabId, chartId, respPayload } = item;

    if (respPayload.status === 'error') {
      this.stopPolling({ tabId: tabId });

      this.explorerTabsQuery.setContent({
        tabId: tabId,
        content: { status: 'error', errors: respPayload.errors }
      });

      return;
    }

    this.explorerTabsQuery.setContent({
      tabId: tabId,
      content: {
        status: 'ready',
        chart: respPayload.chart,
        mconfig: respPayload.mconfig,
        query: respPayload.query
      }
    });

    if (respPayload.query.status === QueryStatusEnum.Running) {
      this.startPolling({
        sessionId: sessionId,
        tabId: tabId,
        chartId: chartId
      });
    } else {
      this.stopPolling({ tabId: tabId });
    }
  }

  private startPolling(item: {
    sessionId: string;
    tabId: string;
    chartId: string;
  }) {
    let { sessionId, tabId, chartId } = item;

    if (this.pollingByTabId.has(tabId)) return;

    let payload: ToBackendOpenExplorerChartTabRequestPayload = {
      sessionId: sessionId,
      chartId: chartId
    };

    let sub = interval(3000)
      .pipe(
        concatMap(() =>
          this.apiService.req({
            pathInfoName:
              ToBackendRequestInfoNameEnum.ToBackendOpenExplorerChartTab,
            payload: payload
          })
        ),
        tap((resp: ToBackendOpenExplorerChartTabResponse) => {
          this.setTabPayload({
            sessionId: sessionId,
            tabId: tabId,
            chartId: chartId,
            respPayload: resp.payload
          });
        })
      )
      .subscribe();

    this.pollingByTabId.set(tabId, sub);
  }

  private stopPolling(item: { tabId: string }) {
    let sub = this.pollingByTabId.get(item.tabId);

    if (!sub) return;

    sub.unsubscribe();
    this.pollingByTabId.delete(item.tabId);
  }
}
