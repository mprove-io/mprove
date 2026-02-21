import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import uFuzzy from '@leeoniya/ufuzzy';
import { tap } from 'rxjs/operators';
import { MODELS_LIST_PAGE_TITLE } from '#common/constants/page-titles';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { ModelX } from '#common/interfaces/backend/model-x';
import { MemberQuery } from '#front/app/queries/member.query';
import { ModelQuery } from '#front/app/queries/model.query';
import { ModelsQuery } from '#front/app/queries/models.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-models-list',
  templateUrl: './models-list.component.html'
})
export class ModelsListComponent implements OnInit, OnDestroy {
  pageTitle = MODELS_LIST_PAGE_TITLE;

  models: ModelX[];
  modelsFilteredByWord: ModelX[];
  filteredModels: ModelX[];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  models$ = this.modelsQuery.select().pipe(
    tap(ml => {
      this.models = ml.models.filter(x => x.hasAccess === true);

      this.makeFilteredModels();

      this.cd.detectChanges();
    })
  );

  modelId: string;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.modelId = x.modelId;
      this.cd.detectChanges();
    })
  );

  word: string;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private modelQuery: ModelQuery,
    private navigateService: NavigateService,
    private uiService: UiService,
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

    if (isDefinedAndNotEmpty(this.word)) {
      let haystack = modelsA.map(x => `${x.label} ${x.modelId}`);
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.modelsFilteredByWord = isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map((idx: number): ModelX => modelsA[idx])
        : []
      : modelsA;

    this.filteredModels = this.modelsFilteredByWord;

    this.filteredModels = this.filteredModels.sort((a, b) => {
      let aLabel = a.label || a.modelId;
      let bLabel = b.label || b.modelId;

      return aLabel > bLabel ? 1 : bLabel > aLabel ? -1 : 0;
    });
  }

  trackByFn(index: number, item: ModelX) {
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
            search: isDefinedAndNotEmpty(this.word) ? this.word : undefined
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
          search: isDefinedAndNotEmpty(this.word) ? this.word : undefined
        }
      })
      .toString();

    this.location.replaceState(url);
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToFile(event: any, model: ModelX) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.uiService.ensureFilesLeftPanel();
    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  navigateToModel(item: ModelX) {
    if (item.hasAccess === false) {
      return;
    }

    this.navigateService.navigateToModelsList({
      modelId: item.modelId
    });

    if (this.uiQuery.getValue().showSchema === false) {
      this.uiQuery.updatePart({ showSchema: true });
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
