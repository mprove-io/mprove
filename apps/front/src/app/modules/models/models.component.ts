import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
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

  showViews = false;

  isShow = true;

  models: common.ModelX[];
  modelsFilteredByWord: common.ModelX[];
  filteredModels: common.ModelX[];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  models$ = this.modelsQuery.select().pipe(
    tap(ml => {
      this.models = ml.models;

      // let allGroups = this.vizs.map(v => v.gr);
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
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
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

    this.filteredModels = this.modelsFilteredByWord;

    this.filteredModels = this.filteredModels.sort((a, b) => {
      let aLabel = a.label || a.modelId;
      let bLabel = b.label || b.modelId;

      return aLabel > bLabel ? 1 : bLabel > aLabel ? -1 : 0;
    });
  }

  trackByFn(index: number, item: common.ModelX) {
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

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToModelFile(event: any, model: common.ModelX) {
    event.stopPropagation();

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToFile(event: any, node: common.ModelNode, model: common.ModelX) {
    event.stopPropagation();

    let fileIdAr = common.isDefined(node.viewFilePath)
      ? node.viewFilePath.split('/')
      : model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
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

  navigateToModel(item: common.ModelX) {
    if (item.hasAccess === false) {
      return;
    }

    this.navigateService.navigateToModel(item.modelId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyModels')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
