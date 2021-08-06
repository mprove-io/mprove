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

  vizs: common.Viz[];
  vizs$ = this.vizsQuery.vizs$.pipe(
    tap(x => {
      this.vizs = x;

      let allGroups = x.map(z => z.gr);
      let definedGroups = allGroups.filter(y => common.isDefined(y));

      this.groups = [...new Set(definedGroups)];

      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private vizsQuery: VizsQuery
  ) {}
}
