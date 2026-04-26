import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, tap } from 'rxjs/operators';
import { EXPLORER_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_SESSION } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { CHAT_SCOPE } from '../chat/chat-scope.token';

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
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {}

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
