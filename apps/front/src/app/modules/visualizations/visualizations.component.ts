import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { VizsQuery } from '~front/app/queries/vizs.query';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-visualizations',
  templateUrl: './visualizations.component.html'
})
export class VisualizationsComponent implements OnDestroy {
  groups: string[];

  modelsList: common.ModelsItem[];
  vizs: common.Viz[];
  filteredVizs: common.Viz[];

  vizs$ = this.vizsQuery.select().pipe(
    tap(x => {
      this.vizs = x.vizs;
      this.modelsList = x.modelsList;

      let allGroups = this.vizs.map(z => z.gr);
      let definedGroups = allGroups.filter(y => common.isDefined(y));
      this.groups = [...new Set(definedGroups)];

      this.makeFilteredVizs();

      this.cd.detectChanges();
    })
  );

  modelId: string;

  word: string;

  private timer: any;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private vizsQuery: VizsQuery,
    private myDialogService: MyDialogService
  ) {}

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
  }

  vizDeleted(deletedVizId: string) {
    this.vizs = this.vizs.filter(x => x.vizId !== deletedVizId);
    this.makeFilteredVizs();
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

  newViz() {
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
