import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { ModelQuery } from '~front/app/queries/model.query';

@Component({
  selector: 'm-models-list',
  templateUrl: './models-list.component.html'
})
export class ModelsListComponent implements OnInit, OnDestroy {
  pageTitle = constants.MODELS_LIST_PAGE_TITLE;

  // groups: string[];

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

  modelId: string;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.modelId = x.modelId;
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
    private modelQuery: ModelQuery,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.word = this.route.snapshot.queryParamMap.get('search');
    this.searchWordChange();
  }

  makeFilteredModels() {
    let idxs;

    let modelsA = this.models;

    if (common.isDefinedAndNotEmpty(this.word)) {
      let haystack = modelsA.map(x => `${x.label} ${x.modelId}`);
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.modelsFilteredByWord = common.isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map(idx => modelsA[idx])
        : []
      : modelsA;

    this.filteredModels = this.modelsFilteredByWord;

    this.filteredModels = this.filteredModels.sort((a, b) => {
      let aLabel = a.label || a.modelId;
      let bLabel = b.label || b.modelId;

      return a.isViewModel === true && b.isViewModel === false
        ? 1
        : a.isViewModel === false && b.isViewModel === true
        ? -1
        : aLabel > bLabel
        ? 1
        : bLabel > aLabel
        ? -1
        : 0;
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

      let url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: {
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
    this.makeFilteredModels();
    this.cd.detectChanges();

    let url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {
          search: common.isDefinedAndNotEmpty(this.word) ? this.word : undefined
        }
      })
      .toString();

    this.location.replaceState(url);
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToFile(event: any, model: common.ModelX) {
    event.stopPropagation();

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  navigateToModel(item: common.ModelX) {
    if (item.hasAccess === false) {
      return;
    }

    this.navigateService.navigateToModelsList({
      modelId: item.modelId
    });
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyModels')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
