import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendSetAgentSessionTitleRequestPayload } from '#common/interfaces/to-backend/agent/to-backend-set-agent-session-title';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditSessionTitleDialogData {
  apiService: ApiService;
  sessionId: string;
  title: string;
}

@Component({
  selector: 'm-edit-session-title-dialog',
  templateUrl: './edit-session-title-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, ReactiveFormsModule]
})
export class EditSessionTitleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('titleInput') titleInputElement: ElementRef;

  editTitleForm: FormGroup;

  constructor(
    public ref: DialogRef<EditSessionTitleDialogData>,
    private fb: FormBuilder,
    private sessionQuery: SessionQuery,
    private sessionsQuery: SessionsQuery
  ) {}

  ngOnInit() {
    this.editTitleForm = this.fb.group({
      title: [
        this.ref.data.title,
        [Validators.required, Validators.maxLength(255)]
      ]
    });

    setTimeout(() => {
      this.titleInputElement.nativeElement.focus();
    }, 0);
  }

  save() {
    this.editTitleForm.markAllAsTouched();

    if (!this.editTitleForm.valid) {
      return;
    }

    let newTitle = this.editTitleForm.value.title.trim();
    if (newTitle === this.ref.data.title) {
      this.ref.close();
      return;
    }

    this.ref.close();

    let payload: ToBackendSetAgentSessionTitleRequestPayload = {
      sessionId: this.ref.data.sessionId,
      title: newTitle
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSetAgentSessionTitle,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap(() => {
          let session = this.sessionQuery.getValue();
          if (session?.sessionId === this.ref.data.sessionId) {
            this.sessionQuery.update({ ...session, title: newTitle });
          }

          let sessions = this.sessionsQuery.getValue().sessions;
          let updated = sessions.map(s =>
            s.sessionId === this.ref.data.sessionId
              ? { ...s, title: newTitle }
              : s
          );
          this.sessionsQuery.updatePart({ sessions: updated });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
