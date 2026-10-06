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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendCommitRepoRequest } from '#common/types/backend/routes/repos/commit-repo/commit-repo-request';
import type { ToBackendCommitRepoResponse } from '#common/types/backend/routes/repos/commit-repo/commit-repo-response';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import { RepoQuery } from '#front/app/queries/repo.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionsQuery } from '#front/app/queries/sessions.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { SharedModule } from '../../shared/shared.module';

export interface CommitDialogDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  repoType: RepoType;
  branchId: string;
  builderLeft: BuilderLeft;
  fileId: string;
}

@Component({
  selector: 'm-commit-dialog',
  templateUrl: './commit-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CommitDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('commitMessage') commitMessageElement: ElementRef;

  commitForm: FormGroup<{
    message: FormControl<string>;
  }>;

  isSessionRepo = false;

  constructor(
    public ref: DialogRef<CommitDialogDialogData>,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private fileService: FileService,
    private repoQuery: RepoQuery,
    private sessionQuery: SessionQuery,
    private sessionsQuery: SessionsQuery
  ) {}

  ngOnInit() {
    this.isSessionRepo = this.ref.data.repoType === 'session';

    let epochTs = Math.floor(new Date().getTime() / 1000);

    this.commitForm = this.fb.group({
      message: this.fb.control<string>(`c${epochTs}`, [
        Validators.required,
        Validators.maxLength(255)
      ])
    });

    setTimeout(() => {
      this.commitMessageElement.nativeElement.focus();
    }, 0);
  }

  commit() {
    this.commitForm.markAllAsTouched();

    if (!this.commitForm.valid) {
      return;
    }

    this.ref.close();

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendCommitRepoRequest['input'] = {
      projectId: this.ref.data.projectId,
      repoId: this.ref.data.repoId,
      branchId: this.ref.data.branchId,
      commitMessage: this.commitForm.value.message
    };

    this.spinner.show(APP_SPINNER_NAME);

    apiService
      .req({
        route: 'api/ToBackendCommitRepo',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendCommitRepoResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);

            let respSession = resp.output.session;

            if (isDefined(respSession)) {
              this.sessionQuery.updatePart({
                status: respSession.status,
                archiveReason: respSession.archiveReason
              });

              let sessions = this.sessionsQuery.getValue().sessions;

              this.sessionsQuery.updatePart({
                sessions: sessions.map(s =>
                  s.sessionId === respSession.sessionId
                    ? {
                        ...s,
                        status: respSession.status,
                        archiveReason: respSession.archiveReason
                      }
                    : s
                )
              });
            }

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.ref.data.fileId)
            ? this.fileService.getFile({
                fileId: this.ref.data.fileId,
                builderLeft: this.ref.data.builderLeft
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.fileService.refreshSecondFile();
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
