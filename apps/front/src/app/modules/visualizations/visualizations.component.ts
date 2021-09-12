import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { VizsQuery } from '~front/app/queries/vizs.query';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class ModelsItemExtended extends common.ModelsItem {
  totalVizs: number;
  hasAccess: boolean;
}

@Component({
  selector: 'm-visualizations',
  templateUrl: './visualizations.component.html'
})
export class VisualizationsComponent implements OnInit, OnDestroy {
  pageTitle = constants.VISUALIZATIONS_PAGE_TITLE;

  // groups: string[];

  modelsList: common.ModelsItem[];
  vizsModelsList: ModelsItemExtended[];

  vizs: common.Viz[];
  filteredVizs: common.Viz[];

  hasAccessModelsList: ModelsItemExtended[] = [];
  hasNoAccessModelsList: ModelsItemExtended[] = [];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  vizs$ = this.vizsQuery.select().pipe(
    tap(x => {
      this.vizs = x.vizs;

      this.modelsList = x.modelsList;

      this.hasAccessModelsList = this.modelsList.map(z =>
        Object.assign({}, z, {
          totalVizs: this.vizs.filter(v => v.modelId === z.modelId).length,
          hasAccess: true
        })
      );

      this.hasNoAccessModelsList = x.allModelsList
        .filter(
          c => this.modelsList.findIndex(b => b.modelId === c.modelId) < 0
        )
        .map(z =>
          Object.assign({}, z, {
            totalVizs: this.vizs.filter(v => v.modelId === z.modelId).length,
            hasAccess: false
          })
        );

      this.vizsModelsList = [
        ...this.hasAccessModelsList,
        ...this.hasNoAccessModelsList
      ].sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

      // let allGroups = this.vizs.map(z => z.gr);
      // let definedGroups = allGroups.filter(y => common.isDefined(y));
      // this.groups = [...new Set(definedGroups)];

      this.makeFilteredVizs();

      this.cd.detectChanges();
    })
  );

  modelId: string;

  word: string;

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private vizsQuery: VizsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.word = this.route.snapshot.queryParamMap.get('searchTitle');
    this.searchWordChange();

    if (this.word) {
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
    let vizsFilteredByModel = common.isDefined(this.modelId)
      ? this.vizs.filter(v => v.modelId === this.modelId)
      : this.vizs;

    let vizsFilteredByModelAndKeyword = common.isDefined(this.word)
      ? vizsFilteredByModel.filter(v =>
          v.title.toUpperCase().includes(this.word.toUpperCase())
        )
      : vizsFilteredByModel;

    this.filteredVizs = vizsFilteredByModelAndKeyword;

    this.vizsModelsList = this.vizsModelsList.map(z =>
      Object.assign({}, z, {
        totalVizs: this.filteredVizs.filter(v => v.modelId === z.modelId).length
      })
    );
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
      !this.modelsList ||
      this.modelsList.length === 0
    ) {
      return;
    }

    this.myDialogService.showNewViz({
      modelsList: this.modelsList
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
