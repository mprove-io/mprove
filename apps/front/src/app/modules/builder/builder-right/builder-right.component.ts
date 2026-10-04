import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import type { BuilderRight } from '#common/types/front/builder/builder-right';

import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-builder-right',
  templateUrl: './builder-right.component.html'
})
export class BuilderRightComponent {
  builderRight: BuilderRight = 'Validation';
  builderRight$ = this.uiQuery.builderRight$.pipe(
    tap(x => {
      this.builderRight = x;
      this.cd.detectChanges();
    })
  );

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => {
      this.secondFileNodeId = x;
      this.cd.detectChanges();
    })
  );

  showEvents = false;
  showEvents$ = this.uiQuery.sessionShowEvents$.pipe(
    tap(x => {
      this.showEvents = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}
}
