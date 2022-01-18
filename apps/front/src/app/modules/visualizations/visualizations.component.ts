import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { getColumnFields } from '~front/app/functions/get-column-fields';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { VizsQuery } from '~front/app/queries/vizs.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { ModelStore } from '~front/app/stores/model.store';
import { MqStore } from '~front/app/stores/mq.store';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class ModelsItemExtendedForVizs extends common.ModelsItem {
  totalVizs: number;
}

class ExtendedReport extends common.Report {
  hasAccessToModel?: boolean;
}

export class VizExtended extends common.Viz {
  author?: string;
  canEditOrDeleteViz?: boolean;
  reports: ExtendedReport[];
}

@Component({
  selector: 'm-visualizations',
  templateUrl: './visualizations.component.html'
})
export class VisualizationsComponent implements OnInit, OnDestroy {
  pageTitle = constants.VISUALIZATIONS_PAGE_TITLE;

  vizDeletedFnBindThis = this.vizDeletedFn.bind(this);

  // groups: string[];

  showList = true;
  showBricks = false;

  isShow = true;

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isVizOptionsMenuOpen = false;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

  vizsModelsList: ModelsItemExtendedForVizs[];
  hasAccessModelsList: common.ModelsItem[] = [];

  vizs: VizExtended[];
  vizsFilteredByWord: VizExtended[];
  filteredVizs: VizExtended[];

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

  vizs$ = this.vizsQuery.select().pipe(
    tap(x => {
      this.vizs = x.vizs;

      let member: common.Member;
      this.memberQuery
        .select()
        .pipe(
          tap(z => {
            member = z;
          })
        )
        .subscribe();

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(y => {
          this.hasAccessModelsList = y.allModelsList.filter(
            m => m.hasAccess === true
          );

          this.vizsModelsList = y.allModelsList.map(z =>
            Object.assign({}, z, <ModelsItemExtendedForVizs>{
              totalVizs: this.vizs.filter(v => v.modelId === z.modelId).length
            })
          );

          this.vizs = x.vizs.map(v => {
            let vizFilePathArray = v.filePath.split('/');

            let author =
              vizFilePathArray.length > 1 &&
              vizFilePathArray[1] === common.BLOCKML_USERS_FOLDER
                ? vizFilePathArray[2]
                : undefined;

            let vizExtended: VizExtended = Object.assign({}, v, <VizExtended>{
              author: author,
              canEditOrDeleteViz:
                member.isEditor || member.isAdmin || author === member.alias,
              reports: v.reports.map(report => {
                let extendedReport: ExtendedReport = Object.assign({}, report, <
                  ExtendedReport
                >{
                  hasAccessToModel: checkAccessModel({
                    member: member,
                    model: this.vizsModelsList.find(
                      m => m.modelId === report.modelId
                    )
                  })
                });
                return extendedReport;
              })
            });

            return vizExtended;
          });

          // let allGroups = this.vizs.map(z => z.gr);
          // let definedGroups = allGroups.filter(y => common.isDefined(y));
          // this.groups = [...new Set(definedGroups)];

          this.makeFilteredVizs();

          this.cd.detectChanges();
        });
    })
  );

  modelId: string;

  word: string;
  // fileName: string;

  screenAspectRatio: number;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private modelsListQuery: ModelsListQuery,
    private vizsQuery: VizsQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
    private navQuery: NavQuery,
    public uiStore: UiStore,
    public uiQuery: UiQuery,
    private queryService: QueryService,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title,
    private mqStore: MqStore,
    private modelStore: ModelStore
  ) {}

  calculateAspectRatio() {
    this.screenAspectRatio = window.innerWidth / window.innerHeight;
    // console.log('screenAspectRatio');

    // console.log(this.screenAspectRatio);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateAspectRatio();
  }

  ngOnInit() {
    this.calculateAspectRatio();

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
      this.showList = false;

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
    this.makeFilteredVizs();
  }

  allModelsOnClick() {
    if (common.isUndefined(this.modelId)) {
      return;
    }

    this.modelId = undefined;
    this.makeFilteredVizs();
  }

  makeFilteredVizs() {
    const searcher = new FuzzySearch(this.vizs, ['title', 'vizId'], {
      caseSensitive: false
    });

    this.vizsFilteredByWord = common.isDefined(this.word)
      ? searcher.search(this.word)
      : this.vizs;

    this.filteredVizs = common.isDefined(this.modelId)
      ? this.vizsFilteredByWord.filter(v => v.modelId === this.modelId)
      : this.vizsFilteredByWord;

    this.filteredVizs = this.filteredVizs.sort((a, b) => {
      let aTitle = a.title || a.vizId;
      let bTitle = b.title || b.vizId;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.vizsModelsList = this.vizsModelsList
      .map(z =>
        Object.assign({}, z, {
          totalVizs: this.vizsFilteredByWord.filter(
            v => v.modelId === z.modelId
          ).length
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  vizDeletedFn(deletedVizId: string) {
    this.vizs = this.vizs.filter(x => x.vizId !== deletedVizId);

    this.makeFilteredVizs();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: VizExtended) {
    return item.vizId;
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredVizs();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredVizs();
    this.cd.detectChanges();
  }

  newViz() {
    this.myDialogService.showNewViz({
      modelsList: this.hasAccessModelsList
    });
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  setShowListTrue() {
    if (this.showList === true) {
      return;
    }

    this.showList = true;
    this.refreshShow();
  }

  setShowListFalse() {
    if (this.showList === false) {
      return;
    }

    this.showList = false;
    this.refreshShow();
  }

  toggleShowFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  navigateToViz(vizId: string) {}

  async explore(event: any, item: VizExtended) {
    event.stopPropagation();
    this.closeMenu();

    this.spinner.show(item.vizId);

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
      mconfigId: item.reports[0].mconfigId
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
      mconfigId: item.reports[0].mconfigId,
      queryId: item.reports[0].queryId,
      vizId: item.vizId
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

    this.modelStore.update(model);

    this.mqStore.update(state =>
      Object.assign({}, state, { mconfig: mconfig, query: query })
    );

    this.navigateService.navigateMconfigQuery({
      modelId: model.modelId,
      mconfigId: mconfig.mconfigId,
      queryId: query.queryId
    });

    this.spinner.hide(item.vizId);
  }

  async showChart(item: VizExtended) {
    this.spinner.show(item.vizId);

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
      mconfigId: item.reports[0].mconfigId
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
      mconfigId: item.reports[0].mconfigId,
      queryId: item.reports[0].queryId,
      vizId: item.vizId
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

    this.spinner.hide(item.vizId);
  }

  openMenu(item: VizExtended) {
    this.isVizOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: item.vizId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isVizOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event: MouseEvent, item: VizExtended) {
    event.stopPropagation();
    if (this.isVizOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu(item);
    }
  }

  goToVizFile(event: MouseEvent, item: VizExtended) {
    event.stopPropagation();
    this.closeMenu();

    let fileIdAr = item.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  async editVizInfo(event: MouseEvent, item: VizExtended) {
    event.stopPropagation();
    this.closeMenu();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      mconfigId: item.reports[0].mconfigId
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

    this.myDialogService.showEditVizInfo({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      viz: item,
      mconfig: mconfig
    });
  }

  deleteViz(event: MouseEvent, item: VizExtended) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showDeleteViz({
      viz: item,
      apiService: this.apiService,
      vizDeletedFnBindThis: this.vizDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  goToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyVizs')
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (common.isDefined(this.openedMenuId))
      this.uiStore.update({ openedMenuId: undefined });
  }
}
