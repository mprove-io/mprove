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

  showBricks = true;

  modelsList: common.ModelsItem[];
  vizsModelsList: ModelsItemExtended[];

  vizs: common.Viz[];
  vizsFilteredByWord: common.Viz[];
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
  // fileName: string;

  screenAspectRatio: number;

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
      !this.modelsList ||
      this.modelsList.length === 0
    ) {
      return;
    }

    this.myDialogService.showNewViz({
      modelsList: this.modelsList
    });
  }

  toggleShowFilters() {
    this.showBricks = !this.showBricks;
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyVizs')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
