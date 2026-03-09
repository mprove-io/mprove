import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UiQuery } from '#front/app/queries/ui.query';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-auto-accept-toggle',
  templateUrl: './auto-accept-toggle.component.html'
})
export class AutoAcceptToggleComponent {
  @Input() sessionId: string;

  autoAccept = false;
  tooltipText = '';

  state$ = combineLatest([
    this.uiQuery.permissionsAutoAcceptSessionIds$,
    this.uiQuery.newSessionAutoAccept$
  ]).pipe(
    tap(([permissionsAutoAcceptSessionIds, newSessionAutoAccept]) => {
      if (this.sessionId) {
        let ids = permissionsAutoAcceptSessionIds || [];
        this.autoAccept = ids.includes(this.sessionId);
      } else {
        this.autoAccept = newSessionAutoAccept;
      }

      this.tooltipText = this.autoAccept
        ? 'Permissions auto-accept: ON'
        : 'Permissions auto-accept: OFF';

      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private uiService: UiService,
    private cd: ChangeDetectorRef
  ) {}

  onToggle() {
    let newValue = !this.autoAccept;

    if (this.sessionId) {
      let ids = this.uiQuery.getValue().permissionsAutoAcceptSessionIds || [];
      let newIds = newValue
        ? [...ids, this.sessionId]
        : ids.filter(id => id !== this.sessionId);
      this.uiQuery.updatePart({
        permissionsAutoAcceptSessionIds: newIds
      });
      this.uiService.setUserUi({
        permissionsAutoAcceptSessionIds: newIds
      });
    } else {
      this.uiQuery.updatePart({ newSessionAutoAccept: newValue });
    }
  }
}
