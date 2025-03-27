import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import uFuzzy from '@leeoniya/ufuzzy';
import { filter, take, tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { FilteredDashboardsQuery } from '~front/app/queries/filtered-dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { StructDashboardResolver } from '~front/app/resolvers/struct-dashboard.resolver';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export class ModelXWithTotalDashboards extends common.ModelX {
  totalDashboards: number;
}

@Component({
  selector: 'm-dashboards',
  templateUrl: './dashboards.component.html'
})
export class DashboardsComponent implements OnInit, OnDestroy {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  pageTitle = constants.DASHBOARDS_PAGE_TITLE;

  dashboardDeletedFnBindThis = this.dashboardDeletedFn.bind(this);

  pathDashboardsList = common.PATH_DASHBOARDS_LIST;

  // groups: string[];

  showBricks = false;
  showTiles = false;

  isShow = true;

  timezoneForm = this.fb.group({
    timezone: [
      {
        value: undefined
      }
    ]
  });

  timezones = common.getTimezones();

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  member: common.Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

  hasAccessModels: common.ModelX[] = [];

  filteredDraftsLength: number;

  dashboards: common.DashboardX[];
  dashboardsFilteredByWord: common.DashboardX[];
  filteredDashboards: common.DashboardX[];

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      this.modelsQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          this.hasAccessModels = ml.models.filter(m => m.hasAccess === true);

          this.makeFilteredDashboards();
          this.cd.detectChanges();
        });
    })
  );

  dashboard: common.DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    tap(x => {
      this.dashboard = x;

      let uiState = this.uiQuery.getValue();
      this.timezoneForm.controls['timezone'].setValue(uiState.timezone);

      if (common.isDefined(this.dashboard?.dashboardId)) {
        this.title.setTitle(
          `${this.pageTitle} - ${
            this.dashboard?.title || this.dashboard?.dashboardId
          }`
        );
      }

      this.cd.detectChanges();
    })
  );

  modelId: string;

  word: string;
  // fileName: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private structDashboardResolver: StructDashboardResolver,
    private structQuery: StructQuery,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private dashboardsQuery: DashboardsQuery,
    private filteredDashboardsQuery: FilteredDashboardsQuery,
    private dashboardQuery: DashboardQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];

    this.word = this.route.snapshot.queryParamMap.get('search');
    this.searchWordChange();
  }

  makeFilteredDashboards() {
    let idxs;

    if (common.isDefinedAndNotEmpty(this.word)) {
      // let haystack = this.dashboards.map(x => `${x.title} ${x.dashboardId}`);
      let haystack = this.dashboards.map(x =>
        common.isDefined(x.title) ? `${x.title}` : `${x.dashboardId}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.dashboardsFilteredByWord = common.isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map(idx => this.dashboards[idx])
        : []
      : this.dashboards;

    this.filteredDashboards = common.isDefined(this.modelId)
      ? this.dashboardsFilteredByWord.filter(
          d => d.tiles.map(rp => rp.modelId).indexOf(this.modelId) > -1
        )
      : this.dashboardsFilteredByWord;

    this.filteredDashboards = this.filteredDashboards.sort((a, b) => {
      let aTitle = a.title || a.dashboardId;
      let bTitle = b.title || b.dashboardId;

      return b.temp === true && a.temp !== true
        ? 1
        : a.temp === true && b.temp !== true
        ? -1
        : aTitle > bTitle
        ? 1
        : bTitle > aTitle
        ? -1
        : 0;
    });

    this.filteredDashboardsQuery.update({
      filteredDashboards: this.filteredDashboards
    });

    this.filteredDraftsLength = this.filteredDashboards.filter(
      y => y.temp === true
    ).length;
  }

  dashboardDeletedFn(deletedDashboardId: string) {
    this.dashboards = this.dashboards.filter(
      x => x.dashboardId !== deletedDashboardId
    );

    this.makeFilteredDashboards();
    this.cd.detectChanges();
  }

  deleteDrafts() {}

  deleteDraftDashboard(event: any, dashboard: common.DashboardX) {
    event.stopPropagation();
  }

  dashboardSaveAs(event: any) {
    event.stopPropagation();
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredDashboards();
      this.cd.detectChanges();

      let uiState = this.uiQuery.getValue();
      let timezoneParam = this.route.snapshot.queryParamMap.get('timezone');
      let structState = this.structQuery.getValue();

      let timezone =
        structState.allowTimezones === false
          ? structState.defaultTimezone
          : common.isDefined(timezoneParam)
          ? timezoneParam.split('-').join('/')
          : uiState.timezone;

      if (uiState.timezone !== timezone) {
        this.uiQuery.updatePart({ timezone: timezone });
        this.uiService.setUserUi({ timezone: timezone });

        this.timezoneForm.controls['timezone'].setValue(timezone);
      }

      let url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: {
            timezone: timezone.split('/').join('-'),
            search: common.isDefinedAndNotEmpty(this.word)
              ? this.word
              : undefined
          }
        })
        .toString();

      this.location.replaceState(url);
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();
    this.cd.detectChanges();

    let uiState = this.uiQuery.getValue();
    let timezoneParam = this.route.snapshot.queryParamMap.get('timezone');
    let structState = this.structQuery.getValue();

    let timezone =
      structState.allowTimezones === false
        ? structState.defaultTimezone
        : common.isDefined(timezoneParam)
        ? timezoneParam.split('-').join('/')
        : uiState.timezone;

    let url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {
          timezone: timezone.split('/').join('-'),
          search: common.isDefinedAndNotEmpty(this.word) ? this.word : undefined
        }
      })
      .toString();

    this.location.replaceState(url);
  }

  addDashboard() {
    this.myDialogService.showDashboardsNew({
      apiService: this.apiService
    });
  }

  goToDashboardFile(event: any, dashboard: common.DashboardX) {
    event.stopPropagation();

    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteDashboard(event: MouseEvent, item: common.DashboardX) {
    event.stopPropagation();

    this.myDialogService.showDeleteDashboard({
      dashboard: item,
      apiService: this.apiService,
      dashboardDeletedFnBindThis: this.dashboardDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      isStartSpinnerUntilNavEnd: false
    });
  }

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard(dashboardId);
  }

  navigateToDashboardsList() {
    this.title.setTitle(this.pageTitle);

    this.navigateService.navigateToDashboardsList();
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    let uiState = this.uiQuery.getValue();

    if (this.lastUrl === common.PATH_DASHBOARDS) {
      this.navigateService.navigateToDashboards();
    } else if (this.lastUrl === common.PATH_DASHBOARDS_LIST) {
      this.navigateService.navigateToDashboardsList();
    } else if (common.isDefined(this.dashboard.dashboardId)) {
      this.structDashboardResolver
        .resolveRoute({
          dashboardId: this.dashboard.dashboardId,
          route: this.route.snapshot,
          showSpinner: true,
          timezone: uiState.timezone
        })
        .pipe(
          tap(x => {
            let uiStateB = this.uiQuery.getValue();

            let url = this.router
              .createUrlTree([], {
                relativeTo: this.route,
                queryParams: {
                  timezone: uiStateB.timezone.split('/').join('-')
                }
              })
              .toString();

            this.location.go(url);
          }),
          take(1)
        )
        .subscribe();
    }
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyDashboards')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
