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
import { getCanAccessModel } from '~front/app/functions/get-can-access-model';
import { getColumnFields } from '~front/app/functions/get-column-fields';
import { getExtendedFilters } from '~front/app/functions/get-extended-filters';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { VizsQuery } from '~front/app/queries/vizs.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class VizsModelsItemExtended extends common.ModelsItem {
  totalVizs: number;
}

@Component({
  selector: 'm-visualizations',
  templateUrl: './visualizations.component.html'
})
export class VisualizationsComponent implements OnInit, OnDestroy {
  pageTitle = constants.VISUALIZATIONS_PAGE_TITLE;

  // groups: string[];

  showList = false;
  showBricks = false;

  isShow = true;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

  vizsModelsList: VizsModelsItemExtended[];
  hasAccessModelsList: common.ModelsItem[] = [];

  vizs: common.Viz[];
  vizsFilteredByWord: common.Viz[];
  filteredVizs: common.Viz[];

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

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(y => {
          this.hasAccessModelsList = y.allModelsList.filter(
            m => m.hasAccess === true
          );

          this.vizsModelsList = y.allModelsList.map(z =>
            Object.assign({}, z, <VizsModelsItemExtended>{
              totalVizs: this.vizs.filter(v => v.modelId === z.modelId).length
            })
          );

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
    private queryService: QueryService,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
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

    this.filteredVizs = this.filteredVizs.sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0
    );

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

  vizDeleted(deletedVizId: string) {
    let deletedVizModelId = this.vizs.find(viz => viz.vizId === deletedVizId)
      ?.modelId;

    this.vizs = this.vizs.filter(x => x.vizId !== deletedVizId);

    if (common.isDefined(deletedVizModelId)) {
      let modelItemExtended = this.vizsModelsList.find(
        x => x.modelId === deletedVizModelId
      );
      if (common.isDefined(modelItemExtended)) {
        modelItemExtended.totalVizs = modelItemExtended.totalVizs - 1;
      }
    }

    this.makeFilteredVizs();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: common.Viz) {
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
    if (
      this.isExplorer === false ||
      !this.hasAccessModelsList ||
      this.hasAccessModelsList.length === 0
    ) {
      return;
    }

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

  async showChart(item: common.Viz) {
    this.spinner.show(item.vizId);

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

    let extendedFilters = getExtendedFilters({
      fields: model.fields,
      mconfig: mconfig
    });

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

    let canAccessModel = getCanAccessModel({
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

  hasAccessToModel(modelId: string) {
    return this.hasAccessModelsList.map(x => x.modelId).indexOf(modelId) > -1;
  }

  goToVizFile(event: any, item: common.Viz) {
    event.stopPropagation();

    let fileIdAr = item.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
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
  }
}
