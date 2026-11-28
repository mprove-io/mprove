import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MODELS_LIST_PAGE_TITLE } from '#common/constants/page-titles';

import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import { MemberQuery } from '#front/app/queries/member.query';
import { ModelQuery } from '#front/app/queries/model.query';
import { ModelsQuery } from '#front/app/queries/models.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { matchModels } from '../../shared/catalog-search/match-models';

@Component({
  standalone: false,
  selector: 'm-models-list',
  templateUrl: './models-list.component.html'
})
export class ModelsListComponent implements OnInit {
  pageTitle = MODELS_LIST_PAGE_TITLE;

  filteredModels: ModelX[];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  models$ = combineLatest([
    this.modelsQuery.select(),
    this.route.queryParamMap
  ]).pipe(
    tap(([state, params]) => {
      this.word = params.get('search') ?? '';

      let models: ModelX[] = state.models.filter(
        model => model.hasAccess === true
      );

      let matches: ModelX[] = isDefinedAndNotEmpty(this.word)
        ? matchModels({ models: models, word: this.word }).map(
            match => match.item
          )
        : models;

      this.filteredModels = matches.sort((a, b) => {
        let aLabel = a.label || a.modelId;
        let bLabel = b.label || b.modelId;

        return aLabel > bLabel ? 1 : bLabel > aLabel ? -1 : 0;
      });

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

  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private uiQuery: UiQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private modelQuery: ModelQuery,
    private navigateService: NavigateService,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle(this.pageTitle);
  }

  trackByFn(index: number, item: ModelX) {
    return item.modelId;
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

    this.navigateService.navigateToFileLine({
      builderLeft: 'Tree',
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  navigateToModel(item: ModelX) {
    if (item.hasAccess === false) {
      return;
    }

    void this.navigateService.navigateToModelsList({
      modelId: item.modelId,
      search: this.word
    });

    if (this.uiQuery.getValue().showSchema === false) {
      this.uiQuery.updatePart({ showSchema: true });
    }
  }
}
