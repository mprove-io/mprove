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
  activeTabId: string;
  contents: Record<string, ExplorerTabContent>;
}

let explorerTabsState: ExplorerTabsState = {
  sessionId: undefined,
  tabs: [],
  activeTabId: undefined,
  contents: {}
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

  setSession(item: { sessionId: string }) {
    this.update({
      sessionId: item.sessionId,
      tabs: [],
      activeTabId: undefined,
      contents: {}
    });
  }

  appendTab(item: { tab: ExplorerTab }) {
    let state = this.getValue();

    let exists = state.tabs.some(t => t.id === item.tab.id);

    if (exists) return;

    this.updatePart({ tabs: [...state.tabs, item.tab] });
  }

  removeTab(item: { tabId: string }) {
    let state = this.getValue();

    let tabs = state.tabs.filter(t => t.id !== item.tabId);

    let contents = { ...state.contents };

    delete contents[item.tabId];

    let activeTabId =
      state.activeTabId === item.tabId
        ? (tabs[tabs.length - 1]?.id ?? null)
        : state.activeTabId;

    this.updatePart({
      tabs: tabs,
      contents: contents,
      activeTabId: activeTabId
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
      activeTabId: undefined,
      contents: {}
    });
  }
}
