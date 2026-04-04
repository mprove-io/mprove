import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PROD_REPO_ID } from '#common/constants/top';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendDeleteSessionRequestPayload } from '#common/interfaces/to-backend/sessions/to-backend-delete-session';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

export interface DeleteSessionDialogData {
  apiService: ApiService;
  sessionId: string;
  title: string;
}

@Component({
  selector: 'm-delete-session-dialog',
  templateUrl: './delete-session-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteSessionDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteSessionDialogData>,
    private sessionQuery: SessionQuery,
    private sessionsQuery: SessionsQuery,
    private navigateService: NavigateService,
    private uiQuery: UiQuery,
    private uiService: UiService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let sessionId = this.ref.data.sessionId;

    let payload: ToBackendDeleteSessionRequestPayload = {
      sessionId: sessionId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteSession,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap(() => {
          let sessions = this.sessionsQuery.getValue().sessions;
          let updated = sessions.filter(s => s.sessionId !== sessionId);
          this.sessionsQuery.updatePart({ sessions: updated });

          // Remove from permissionsAutoAcceptSessionIds
          let sessionIds =
            this.uiQuery.getValue().permissionsAutoAcceptSessionIds || [];
          if (sessionIds.includes(sessionId)) {
            let newSessionIds = sessionIds.filter(id => id !== sessionId);
            this.uiQuery.updatePart({
              permissionsAutoAcceptSessionIds: newSessionIds
            });
            this.uiService.setUserUi({
              permissionsAutoAcceptSessionIds: newSessionIds
            });
          }

          let currentSession = this.sessionQuery.getValue();
          if (currentSession?.sessionId === sessionId) {
            this.navigateService.navigateToBuilder({
              repoId: PROD_REPO_ID,
              branchId: this.navigateService.nav.projectDefaultBranch
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
