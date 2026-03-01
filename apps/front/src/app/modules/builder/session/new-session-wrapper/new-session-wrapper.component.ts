import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-new-session-wrapper',
  templateUrl: './new-session-wrapper.component.html'
})
export class NewSessionWrapperComponent {
  showContent = true;

  showContent$ = this.uiQuery.showContent$.pipe(
    tap(x => {
      this.showContent = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}
}
