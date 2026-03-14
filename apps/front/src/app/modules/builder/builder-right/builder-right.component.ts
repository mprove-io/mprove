import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-builder-right',
  templateUrl: './builder-right.component.html'
})
export class BuilderRightComponent {
  builderRightSessions = BuilderRightEnum.Sessions;
  builderRightSchema = BuilderRightEnum.Schema;
  builderRightValidation = BuilderRightEnum.Validation;

  builderRight = BuilderRightEnum.Sessions;
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

  constructor(
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}
}
