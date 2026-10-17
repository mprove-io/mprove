import { Injectable } from '@angular/core';
import { interval, type Subscription } from 'rxjs';
import { exhaustMap, finalize, tap } from 'rxjs/operators';

import type { ToBackendGetExplorerChartTabOutput } from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-output';
import type { ToBackendCloseExplorerSessionTabRequest } from '#common/types/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-request';
import { ExplorerTabsQuery } from '#front/app/queries/explorer-tabs.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { ApiService } from '#front/app/services/api.service';

@Injectable({ providedIn: 'root' })
export class ExplorerTabService {
  private pollingByTabId = new Map<string, Subscription>();

  private initialFetchByTabId = new Map<string, Subscription>();

  constructor(
    private apiService: ApiService,
    private explorerTabsQuery: ExplorerTabsQuery,
    private sessionQuery: SessionQuery
  ) {}

  openTab(item: { sessionId: string; tabId: string; chartId: string }) {
    let { sessionId, tabId, chartId } = item;

    this.stopPolling({ tabId: tabId });

    this.initialFetchByTabId.get(tabId)?.unsubscribe();

    this.explorerTabsQuery.setContent({
      tabId: tabId,
      content: { status: 'loading' }
    });

    let sub: Subscription = this.apiService
      .req({
        route: 'api/ToBackendGetExplorerChartTab',
        payload: {
          sessionId: sessionId,
          chartId: chartId
        }
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendGetExplorerChartTabOutput = resp.output;

          this.setTabPayload({
            sessionId: sessionId,
            tabId: tabId,
            chartId: chartId,
            respPayload: output
          });
        }),
        finalize(() => {
          this.initialFetchByTabId.delete(tabId);

          if (
            this.explorerTabsQuery.getValue().contents[tabId]?.status ===
            'loading'
          ) {
            this.explorerTabsQuery.setContent({
              tabId: tabId,
              content: { status: 'idle' }
            });
          }
        })
      )
      .subscribe();

    this.initialFetchByTabId.set(tabId, sub);
  }

  openTabFromMessages(item: { sessionId: string; tabId: string }) {
    let closedExplorerTabIds = this.explorerTabsQuery.reopenTab({
      tabId: item.tabId
    });

    this.persistClosedTabs({
      sessionId: item.sessionId,
      closedExplorerTabIds: closedExplorerTabIds
    });
  }

  closeTab(item: { sessionId: string; tabId: string }) {
    this.stopPolling({ tabId: item.tabId });

    this.initialFetchByTabId.get(item.tabId)?.unsubscribe();

    let closedExplorerTabIds = this.explorerTabsQuery.closeTab({
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
    let payload: ToBackendCloseExplorerSessionTabRequest['input'] = {
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
        route: 'api/ToBackendCloseExplorerSessionTab',
        payload: payload
      })
      .subscribe();
  }

  stopAllPolling() {
    this.initialFetchByTabId.forEach(sub => {
      sub.unsubscribe();
    });

    this.initialFetchByTabId.clear();

    this.pollingByTabId.forEach(sub => {
      sub.unsubscribe();
    });

    this.pollingByTabId.clear();
  }

  private setTabPayload(item: {
    sessionId: string;
    tabId: string;
    chartId: string;
    respPayload: ToBackendGetExplorerChartTabOutput;
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

    if (respPayload.query.status === 'Running') {
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

    let sub: Subscription = interval(2500)
      .pipe(
        exhaustMap(() =>
          this.apiService.req({
            route: 'api/ToBackendGetExplorerChartTab',
            payload: {
              sessionId: sessionId,
              chartId: chartId
            }
          })
        ),
        tap(resp => {
          if (resp.type !== 'Success') {
            this.stopPolling({ tabId: tabId });

            return;
          }

          let output: ToBackendGetExplorerChartTabOutput = resp.output;

          this.setTabPayload({
            sessionId: sessionId,
            tabId: tabId,
            chartId: chartId,
            respPayload: output
          });
        })
      )
      .subscribe();

    this.pollingByTabId.set(tabId, sub);
  }

  private stopPolling(item: { tabId: string }) {
    let { tabId } = item;

    let sub: Subscription = this.pollingByTabId.get(tabId);

    if (!sub) return;

    sub.unsubscribe();

    this.pollingByTabId.delete(tabId);
  }
}
