import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { getColumnFields } from '~front/app/functions/get-column-fields';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { DashboardWithExtendedFilters } from '~front/app/stores/dashboards.store';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class DashboardsModelsItemExtended extends common.ModelsItem {
  totalDashboards: number;
}

class ExtendedReport extends common.Report {
  hasAccessToModel?: boolean;
}

export class DashboardExtended extends DashboardWithExtendedFilters {
  author?: string;
  canEditOrDeleteDashboard?: boolean;
  reports: ExtendedReport[];
}

@Component({
  selector: 'm-dashboards',
  templateUrl: './dashboards.component.html'
})
export class DashboardsComponent implements OnInit, OnDestroy {
  pageTitle = constants.DASHBOARDS_PAGE_TITLE;

  dashboardDeletedFnBindThis = this.dashboardDeletedFn.bind(this);

  // groups: string[];

  showBricks = false;
  showReports = false;

  isShow = true;

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isDashboardOptionsMenuOpen = false;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

  dashboardsModelsList: DashboardsModelsItemExtended[];
  hasAccessModelsList: common.ModelsItem[];

  dashboards: DashboardExtended[];
  dashboardsFilteredByWord: DashboardExtended[];
  filteredDashboards: DashboardExtended[];

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

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      let member: common.Member;
      this.memberQuery
        .select()
        .pipe()
        .subscribe(y => {
          member = y;
        });

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          this.hasAccessModelsList = ml.allModelsList.filter(
            m => m.hasAccess === true
          );

          this.dashboardsModelsList = ml.allModelsList.map(z =>
            Object.assign({}, z, <DashboardsModelsItemExtended>{
              totalDashboards: this.dashboards.filter(
                v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
              ).length
            })
          );

          this.dashboards = this.dashboards.map(d => {
            let dashboardFilePathArray = d.filePath.split('/');

            let author =
              dashboardFilePathArray.length > 1 &&
              dashboardFilePathArray[1] === common.BLOCKML_USERS_FOLDER
                ? dashboardFilePathArray[2]
                : undefined;

            let dashboardExtended: DashboardExtended = Object.assign({}, d, <
              DashboardExtended
            >{
              author: author,
              canEditOrDeleteDashboard:
                member.isEditor || member.isAdmin || author === member.alias,
              reports: d.reports.map(report => {
                let extendedReport: ExtendedReport = Object.assign({}, report, <
                  ExtendedReport
                >{
                  hasAccessToModel: checkAccessModel({
                    member: member,
                    model: this.dashboardsModelsList.find(
                      m => m.modelId === report.modelId
                    )
                  })
                });
                return extendedReport;
              })
            });

            return dashboardExtended;
          });

          // let allGroups = this.vizs.map(z => z.gr);
          // let definedGroups = allGroups.filter(y => common.isDefined(y));
          // this.groups = [...new Set(definedGroups)];

          this.makeFilteredDashboards();

          this.cd.detectChanges();
        });
    })
  );

  modelId: string;

  word: string;
  // fileName: string;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private queryService: QueryService,
    private dashboardsQuery: DashboardsQuery,
    private spinner: NgxSpinnerService,
    private modelsListQuery: ModelsListQuery,
    private memberQuery: MemberQuery,
    public uiStore: UiStore,
    public uiQuery: UiQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    // let searchFileName = this.route.snapshot.queryParamMap.get(
    //   'searchFileName'
    // );
    // if (common.isDefined(searchFileName)) {
    //   let fileNameAr = searchFileName.split('.');
    //   fileNameAr.pop();
    //   this.fileName = fileNameAr.join('.');
    // }

    this.word = this.route.snapshot.queryParamMap.get('search');
    this.searchWordChange();

    if (
      common.isDefined(this.word)
      // || common.isDefined(this.fileName)
    ) {
      const url = this.router
        .createUrlTree([], { relativeTo: this.route, queryParams: {} })
        .toString();

      this.location.go(url);
    }
  }

  modelOnClick(modelId: string) {
    if (this.modelId === modelId) {
      return;
    }
    this.modelId = modelId;
    this.makeFilteredDashboards();
  }

  allModelsOnClick() {
    if (common.isUndefined(this.modelId)) {
      return;
    }
    this.modelId = undefined;
    this.makeFilteredDashboards();
  }

  makeFilteredDashboards() {
    const searcher = new FuzzySearch(
      this.dashboards,
      ['title', 'dashboardId'],
      {
        caseSensitive: false
      }
    );

    this.dashboardsFilteredByWord = common.isDefined(this.word)
      ? searcher.search(this.word)
      : this.dashboards;

    this.filteredDashboards = common.isDefined(this.modelId)
      ? this.dashboardsFilteredByWord.filter(
          d => d.reports.map(rp => rp.modelId).indexOf(this.modelId) > -1
        )
      : this.dashboardsFilteredByWord;

    this.filteredDashboards = this.filteredDashboards.sort((a, b) => {
      let aTitle = a.title || a.dashboardId;
      let bTitle = b.title || b.dashboardId;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.dashboardsModelsList = this.dashboardsModelsList
      .map(z =>
        Object.assign({}, z, {
          totalDashboards: this.dashboardsFilteredByWord.filter(
            d => d.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
          ).length
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  dashboardDeletedFn(deletedDashboardId: string) {
    this.dashboards = this.dashboards.filter(
      x => x.dashboardId !== deletedDashboardId
    );

    this.makeFilteredDashboards();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: DashboardExtended) {
    return item.dashboardId;
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredDashboards();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();
    this.cd.detectChanges();
  }

  newDashboard() {
    this.myDialogService.showDashboardsNew({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  goToDashboardFile(event: any, dashboard: DashboardExtended) {
    event.stopPropagation();

    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToMconfig(report: common.Report) {
    this.navigateService.navigateMconfigQuery({
      modelId: report.modelId,
      mconfigId: report.mconfigId,
      queryId: report.queryId
    });
  }

  async showChart(item: common.Report, dashboardId: string) {
    this.spinner.show(item.mconfigId);

    // this.accessRolesString = 'Roles - ' + this.viz.accessRoles.join(', ');

    // this.accessUsersString = 'Users - ' + this.viz.accessUsers.join(', ');

    // this.accessString =
    //   this.viz.accessRoles.length > 0 && this.viz.accessUsers.length > 0
    //     ? this.accessRolesString + '; ' + this.accessUsersString
    //     : this.viz.accessRoles.length > 0
    //     ? this.accessRolesString
    //     : this.viz.accessUsers.length > 0
    //     ? this.accessUsersString
    //     : '';

    // let vizFilePathArray = this.viz.filePath.split('/');

    // this.author =
    //   vizFilePathArray.length > 1 &&
    //   vizFilePathArray[1] === common.BLOCKML_USERS_FOLDER
    //     ? vizFilePathArray[2]
    //     : undefined;

    let payloadGetModel: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      modelId: item.modelId
    };

    let model: common.Model = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payloadGetModel
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetModelResponse) => resp.payload.model
        )
      )
      .toPromise();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      mconfigId: item.mconfigId
    };

    let mconfig: common.Mconfig = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payloadGetMconfig
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetMconfigResponse) =>
            resp.payload.mconfig
        )
      )
      .toPromise();

    let payloadGetQuery: apiToBackend.ToBackendGetQueryRequestPayload = {
      mconfigId: item.mconfigId,
      queryId: item.queryId,
      dashboardId: dashboardId
    };

    let query: common.Query = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
        payloadGetQuery
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetQueryResponse) => resp.payload.query
        )
      )
      .toPromise();

    let sortedColumns = getColumnFields({
      mconfig: mconfig,
      fields: model.fields
    });

    let qData =
      mconfig.queryId === query.queryId
        ? this.queryService.makeQData({
            data: query.data,
            columns: sortedColumns
          })
        : [];

    let canAccessModel = checkAccessModel({
      model: model,
      member: this.member
    });

    let checkSelectResult = getSelectValid({
      chart: mconfig.chart,
      sortedColumns: sortedColumns
    });

    let isSelectValid = checkSelectResult.isSelectValid;
    // let errorMessage = checkSelectResult.errorMessage;

    this.myDialogService.showChart({
      apiService: this.apiService,
      mconfig: mconfig,
      query: query,
      qData: qData,
      sortedColumns: sortedColumns,
      model: model,
      canAccessModel: canAccessModel,
      showNav: true,
      isSelectValid: isSelectValid
    });

    this.spinner.hide(item.mconfigId);
  }

  openMenu(item: DashboardExtended) {
    this.isDashboardOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: item.dashboardId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isDashboardOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event: MouseEvent, item: DashboardExtended) {
    event.stopPropagation();
    if (this.isDashboardOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu(item);
    }
  }

  deleteDashboard(event: MouseEvent, item: DashboardExtended) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showDeleteDashboard({
      dashboard: item,
      apiService: this.apiService,
      dashboardDeletedFnBindThis: this.dashboardDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  goToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleShowFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  toggleShowReports() {
    this.showReports = !this.showReports;
    this.refreshShow();
  }

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard(dashboardId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyDashboards')
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (common.isDefined(this.openedMenuId))
      this.uiStore.update({ openedMenuId: undefined });
  }
}
