import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { tap } from 'rxjs/operators';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-models',
  templateUrl: './models.component.html'
})
export class ModelsComponent implements OnInit, OnDestroy {
  pageTitle = constants.MODELS_PAGE_TITLE;

  // groups: string[];

  // showBricks = false;
  showViews = true;
  // showModels = false;

  isShow = true;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

  allModelsList: common.ModelsItem[] = [];

  models: common.ModelsItem[];
  modelsFilteredByWord: common.ModelsItem[];
  filteredModels: common.ModelsItem[];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  modelsList$ = this.modelsListQuery.select().pipe(
    tap(ml => {
      this.models = ml.allModelsList;
      this.allModelsList = ml.allModelsList;

      // let allGroups = this.vizs.map(z => z.gr);
      // let definedGroups = allGroups.filter(y => common.isDefined(y));
      // this.groups = [...new Set(definedGroups)];

      this.makeFilteredModels();

      this.cd.detectChanges();
    })
  );

  // dashboards$ = this.dashboardsQuery.select().pipe(
  //   tap(x => {
  //     this.dashboards = x.dashboards;

  //     this.modelsListQuery
  //       .select()
  //       .pipe(take(1))
  //       .subscribe(ml => {
  //         this.modelsList = ml.modelsList;

  //         this.hasAccessModelsList = this.modelsList.map(z =>
  //           Object.assign({}, z, <ModelsItemExtended>{
  //             totalDashboards: this.dashboards.filter(
  //               v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
  //             ).length,
  //             hasAccess: true
  //           })
  //         );

  //         this.allModelsList = ml.allModelsList;

  //         this.hasNoAccessModelsList = this.allModelsList
  //           .filter(
  //             c => this.modelsList.findIndex(b => b.modelId === c.modelId) < 0
  //           )
  //           .map(z =>
  //             Object.assign({}, z, <ModelsItemExtended>{
  //               totalDashboards: this.dashboards.filter(
  //                 v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
  //               ).length,
  //               hasAccess: false
  //             })
  //           );

  //         this.dashboardsModelsList = [
  //           ...this.hasAccessModelsList,
  //           ...this.hasNoAccessModelsList
  //         ].sort((a, b) =>
  //           a.label > b.label ? 1 : b.label > a.label ? -1 : 0
  //         );

  //         // let allGroups = this.vizs.map(z => z.gr);
  //         // let definedGroups = allGroups.filter(y => common.isDefined(y));
  //         // this.groups = [...new Set(definedGroups)];

  //         this.makeFilteredDashboards();

  //         this.cd.detectChanges();
  //       });
  //   })
  // );

  // modelId: string;

  word: string;
  // fileName: string;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private dashboardsQuery: DashboardsQuery,
    private modelsListQuery: ModelsListQuery,
    private memberQuery: MemberQuery,
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

  // modelOnClick(modelId: string) {
  //   if (this.modelId === modelId) {
  //     return;
  //   }
  //   this.modelId = modelId;
  //   this.makeFilteredModels();
  // }

  // allModelsOnClick() {
  //   if (common.isUndefined(this.modelId)) {
  //     return;
  //   }
  //   this.modelId = undefined;
  //   this.makeFilteredModels();
  // }

  makeFilteredModels() {
    const searcher = new FuzzySearch(this.models, ['label', 'modelId'], {
      caseSensitive: false
    });

    this.modelsFilteredByWord = common.isDefined(this.word)
      ? searcher.search(this.word)
      : this.models;

    this.filteredModels =
      // common.isDefined(this.modelId)
      //   ? this.modelsFilteredByWord.filter(
      //       d => d.reports.map(rp => rp.modelId).indexOf(this.modelId) > -1
      //     )
      //   :
      this.modelsFilteredByWord;

    this.filteredModels = this.filteredModels.sort((a, b) =>
      a.label > b.label ? 1 : b.label > a.label ? -1 : 0
    );
  }

  // dashboardDeleted(deletedVizId: string) {
  //   let deletedVizModelId = this.dashboardsList.find(viz => viz.vizId === deletedVizId)
  //     ?.modelId;

  //   this.dashboardsList = this.dashboardsList.filter(x => x.vizId !== deletedVizId);

  //   if (common.isDefined(deletedVizModelId)) {
  //     let modelItemExtended = this.vizsModelsList.find(
  //       x => x.modelId === deletedVizModelId
  //     );
  //     if (common.isDefined(modelItemExtended)) {
  //       modelItemExtended.totalVizs = modelItemExtended.totalVizs - 1;
  //     }
  //   }

  //   this.makeFilteredVizs();
  //   this.cd.detectChanges();
  // }

  trackByFn(index: number, item: common.ModelsItem) {
    return item.modelId;
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredModels();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredModels();
    this.cd.detectChanges();
  }

  goToModelFile(event: any, modelsItem: common.ModelsItem) {
    event.stopPropagation();

    let fileIdAr = modelsItem.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToFile(event: any, node: common.ModelNode, modelsItem: common.ModelsItem) {
    event.stopPropagation();

    let fileIdAr = common.isDefined(node.viewFilePath)
      ? node.viewFilePath.split('/')
      : modelsItem.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  // toggleShowFilters() {
  //   this.showBricks = !this.showBricks;
  //   this.refreshShow();
  // }

  toggleShowViews() {
    this.showViews = !this.showViews;
    this.refreshShow();
  }

  // toggleShowModels() {
  //   this.showModels = !this.showModels;
  //   // this.refreshShow();
  // }

  navigateToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyDashboards')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
