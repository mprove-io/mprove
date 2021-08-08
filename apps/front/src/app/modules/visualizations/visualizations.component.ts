import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { VizsQuery } from '~front/app/queries/vizs.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-visualizations',
  templateUrl: './visualizations.component.html'
})
export class VisualizationsComponent {
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

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private vizsQuery: VizsQuery
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
    this.filteredVizs = common.isDefined(this.modelId)
      ? this.vizs.filter(v => v.modelId === this.modelId)
      : this.vizs;
  }
}
