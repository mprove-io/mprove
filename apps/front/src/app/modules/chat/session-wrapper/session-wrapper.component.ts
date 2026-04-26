import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UiQuery } from '#front/app/queries/ui.query';

@Component({
  standalone: false,
  selector: 'm-session-wrapper',
  templateUrl: './session-wrapper.component.html',
  styleUrl: './session-wrapper.component.scss'
})
export class SessionWrapperComponent {
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
