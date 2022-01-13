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

  showViews = true;

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

  word: string;

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

    this.searchWordChange();
  }

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

  toggleShowViews() {
    this.showViews = !this.showViews;
    this.refreshShow();
  }

  navigateToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyModels')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
