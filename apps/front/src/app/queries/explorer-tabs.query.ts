import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type {
  ExplorerTab,
  ExplorerTabContent
} from '#front/app/modules/explorer/explorer-tab.interface';
import { BaseQuery } from './base.query';

export class ExplorerTabsState {
  sessionId: string;
  tabs: ExplorerTab[];
  allTabs: ExplorerTab[];
  activeTabId: string;
  contents: Record<string, ExplorerTabContent>;
  closedTabIds: string[];
}

let explorerTabsState: ExplorerTabsState = {
  sessionId: undefined,
  tabs: [],
  allTabs: [],
  activeTabId: undefined,
  contents: {},
  closedTabIds: []
};

@Injectable({ providedIn: 'root' })
export class ExplorerTabsQuery extends BaseQuery<ExplorerTabsState> {
  tabs$ = this.store.pipe(select(state => state.tabs));

  activeTabId$ = this.store.pipe(select(state => state.activeTabId));

  contents$ = this.store.pipe(select(state => state.contents));

  constructor() {
    super(
      createStore(
        { name: 'explorerTabs' },
        withProps<ExplorerTabsState>(explorerTabsState)
      )
    );
  }

  setSession(item: { sessionId: string; closedTabIds?: string[] }) {
    this.update({
      sessionId: item.sessionId,
      tabs: [],
      allTabs: [],
      activeTabId: undefined,
      contents: {},
      closedTabIds: item.closedTabIds ?? []
    });
  }

  appendTab(item: { tab: ExplorerTab }): boolean {
    let state = this.getValue();

    let allExists = state.allTabs.some(t => t.id === item.tab.id);
    let allTabs = allExists
      ? state.allTabs.map(t => (t.id === item.tab.id ? item.tab : t))
      : [...state.allTabs, item.tab];

    let isClosed = state.closedTabIds.indexOf(item.tab.id) > -1;

    let exists = state.tabs.some(t => t.id === item.tab.id);

    if (exists || isClosed) {
      let tabs = state.tabs.map(t => (t.id === item.tab.id ? item.tab : t));

      this.updatePart({
        tabs: tabs,
        allTabs: allTabs
      });
      return false;
    }

    this.updatePart({
      allTabs: allTabs,
      tabs: [...state.tabs, item.tab]
    });
    return true;
  }

  closeTab(item: { tabId: string }): string[] {
    let state = this.getValue();

    let tabs = state.tabs.filter(t => t.id !== item.tabId);
    let closedTabIds = state.closedTabIds.includes(item.tabId)
      ? state.closedTabIds
      : [...state.closedTabIds, item.tabId];

    let contents = { ...state.contents };

    delete contents[item.tabId];

    let activeTabId =
      state.activeTabId === item.tabId
        ? (tabs[tabs.length - 1]?.id ?? null)
        : state.activeTabId;

    this.updatePart({
      tabs: tabs,
      contents: contents,
      activeTabId: activeTabId,
      closedTabIds: closedTabIds
    });

    return closedTabIds;
  }

  reopenTab(item: { tabId: string }): string[] {
    let state = this.getValue();
    let closedTabIds = state.closedTabIds.filter(id => id !== item.tabId);
    let tab = state.allTabs.find(t => t.id === item.tabId);

    if (!tab) {
      this.updatePart({ closedTabIds: closedTabIds, activeTabId: item.tabId });
      return closedTabIds;
    }

    let opened = state.tabs.some(t => t.id === item.tabId)
      ? state.tabs
      : state.allTabs.filter(
          t =>
            t.id === item.tabId ||
            (closedTabIds.indexOf(t.id) < 0 &&
              state.tabs.some(openTab => openTab.id === t.id))
        );

    this.updatePart({
      tabs: opened,
      activeTabId: item.tabId,
      closedTabIds: closedTabIds
    });

    return closedTabIds;
  }

  setClosedTabIds(item: { closedTabIds: string[] }) {
    let state = this.getValue();
    let openTabIds = state.tabs.map(t => t.id);
    let tabs = state.allTabs.filter(
      t => item.closedTabIds.indexOf(t.id) < 0 && openTabIds.indexOf(t.id) > -1
    );
    let activeTabId =
      item.closedTabIds.indexOf(state.activeTabId) > -1
        ? (tabs[tabs.length - 1]?.id ?? null)
        : state.activeTabId;

    this.updatePart({
      tabs: tabs,
      activeTabId: activeTabId,
      closedTabIds: item.closedTabIds
    });
  }

  setActive(item: { tabId: string }) {
    this.updatePart({ activeTabId: item.tabId });
  }

  setContent(item: { tabId: string; content: ExplorerTabContent }) {
    let state = this.getValue();

    this.updatePart({
      contents: { ...state.contents, [item.tabId]: item.content }
    });
  }

  resetTabs() {
    this.update({
      sessionId: undefined,
      tabs: [],
      allTabs: [],
      activeTabId: undefined,
      contents: {},
      closedTabIds: []
    });
  }
}
