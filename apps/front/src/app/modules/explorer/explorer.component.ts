import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { EXPLORER_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_SESSION } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ExplorerTabsQuery } from '#front/app/queries/explorer-tabs.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ExplorerTabService } from '#front/app/services/explorer-tab.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { CHAT_SCOPE } from '../chat/chat-scope.token';
import type { ExplorerTab, ExplorerTabContent } from './explorer-tab.interface';

@Component({
  standalone: false,
  selector: 'm-explorer',
  templateUrl: './explorer.component.html',
  providers: [{ provide: CHAT_SCOPE, useValue: 'explorer' }]
})
export class ExplorerComponent implements OnInit {
  pageTitle = EXPLORER_PAGE_TITLE;

  showHistory = false;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isSessionRoute = false;

  tabs$ = this.explorerTabsQuery.tabs$;

  activeTabId$ = this.explorerTabsQuery.activeTabId$;

  activeTabContent$ = combineLatest([
    this.activeTabId$,
    this.explorerTabsQuery.contents$
  ]).pipe(
    map(([activeTabId, contents]): ExplorerTabContent | null =>
      activeTabId ? (contents[activeTabId] ?? { status: 'idle' }) : null
    )
  );

  activeTabOpener$ = this.activeTabId$.pipe(
    tap(activeTabId => {
      if (!activeTabId) return;

      this.openExplorerTab({ tabId: activeTabId });
    })
  );

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');

      let wasSessionRoute = this.isSessionRoute;
      this.isSessionRoute = ar.includes(PATH_SESSION);

      if (wasSessionRoute && !this.isSessionRoute) {
        this.sessionQuery.reset();
        this.sessionBundleQuery.reset();
        this.sessionEventsQuery.reset();
        this.explorerTabsQuery.resetTabs();
      }

      this.spinner.hide(APP_SPINNER_NAME);
      this.uiQuery.updatePart({
        showContent: true,
        showSessionInput: true
      });
      this.cd.detectChanges();
    })
  );

  constructor(
    private title: Title,
    private cd: ChangeDetectorRef,
    private router: Router,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private explorerTabsQuery: ExplorerTabsQuery,
    private explorerTabService: ExplorerTabService,
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {}

  onTabSelect(tabId: string) {
    let state = this.explorerTabsQuery.getValue();

    if (state.activeTabId === tabId) return;

    this.explorerTabsQuery.setActive({ tabId: tabId });
  }

  onTabClose(tabId: string) {
    let session = this.sessionQuery.getValue();

    if (!session?.sessionId) return;

    this.explorerTabService.closeTab({
      sessionId: session.sessionId,
      tabId: tabId
    });
  }

  syntheticTile(content: { chart: any; mconfig: any }) {
    return content.chart?.tiles?.[0] ?? {};
  }

  trackTab(_index: number, tab: ExplorerTab) {
    return tab.id;
  }

  private openExplorerTab(item: { tabId: string }) {
    let state = this.explorerTabsQuery.getValue();

    let tab = state.tabs.find(t => t.id === item.tabId);

    if (!tab || !tab.chartId) return;

    let session = this.sessionQuery.getValue();

    if (!session?.sessionId) return;

    let content = state.contents[item.tabId];

    if (content?.status === 'ready') return;

    this.explorerTabService.openTab({
      sessionId: session.sessionId,
      tabId: item.tabId,
      chartId: tab.chartId
    });
  }

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.isSessionRoute = ar.includes(PATH_SESSION);
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  newChat() {
    this.navigateService.navigateToExplorer();
  }
}
