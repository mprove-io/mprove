import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

import type { ToBackendCreateProjectRequest } from '#common/types/backend/routes/projects/create-project/create-project-request';
import type { ToBackendCreateProjectResponse } from '#common/types/backend/routes/projects/create-project/create-project-response';
import type { ToBackendGenerateProjectRemoteKeyRequest } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-request';
import type { ToBackendGenerateProjectRemoteKeyResponse } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface CreateProjectDialogData {
  apiService: ApiService;
  orgId: string;
}

@Component({
  selector: 'm-create-project-dialog',
  templateUrl: './create-project-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgxSpinnerModule]
})
export class CreateProjectDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  createProjectForm: FormGroup;

  projectRemoteRepoType: ProjectRemoteType = 'GitClone';

  noteId: string;
  publicKey: string;
  maskedPublicKey: string;
  showPublicKey = false;

  isDeployKeyAdded = false;
  copied = false;

  spinnerName = 'createProjectDialogSpinner';

  constructor(
    public ref: DialogRef<CreateProjectDialogData>,
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    let projectName: string;
    let projectGitUrl: string;

    this.spinner.show(this.spinnerName);

    this.createProjectForm = this.fb.group({
      projectName: [
        projectName,
        [Validators.required, Validators.maxLength(255)]
      ],
      projectGitUrl: [
        projectGitUrl,
        [
          Validators.required,
          Validators.maxLength(255),
          ValidationService.gitUrlNotStartWithGitAt
        ]
      ]
    });

    let payload: ToBackendGenerateProjectRemoteKeyRequest['input'] = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendGenerateProjectRemoteKey',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGenerateProjectRemoteKeyResponse) => {
          if (resp?.type === 'Success') {
            this.noteId = resp.output.noteId;
            this.publicKey = resp.output.publicKey;
            this.maskedPublicKey =
              this.publicKey.substring(0, 40) +
              '•'.repeat(this.publicKey.length - 40);

            this.spinner.hide(this.spinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  create() {
    this.createProjectForm.markAllAsTouched();

    if (!this.createProjectForm.controls['projectName'].valid) {
      return;
    }

    if (
      this.projectRemoteRepoType === 'GitClone' &&
      !this.createProjectForm.controls['projectGitUrl'].valid
    ) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let payload: ToBackendCreateProjectRequest['input'] = {
      orgId: this.ref.data.orgId,
      name: this.createProjectForm.value.projectName,
      remoteType: this.projectRemoteRepoType,
      gitUrl: this.createProjectForm.value.projectGitUrl,
      noteId: this.noteId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateProject',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateProjectResponse) => {
          if (resp?.type === 'Success') {
            this.router.navigate([
              PATH_ORG,
              resp.output.project.orgId,
              PATH_PROJECT,
              resp.output.project.projectId,
              PATH_REPO,
              PROD_REPO_ID,
              PATH_BRANCH,
              resp.output.project.defaultBranch,
              PATH_ENV,
              PROJECT_ENV_PROD,
              PATH_BUILDER
            ]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  managedOnClick() {
    this.projectRemoteRepoType = 'Managed';
  }

  gitCloneOnClick() {
    this.projectRemoteRepoType = 'GitClone';
  }

  isDeployKeyAddedOnClick(event: any) {
    event.stopPropagation();
    this.isDeployKeyAdded = !this.isDeployKeyAdded;
    this.cd.detectChanges();
  }

  togglePublicKey() {
    this.showPublicKey = !this.showPublicKey;
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.publicKey).then(() => {
      this.copied = true;
      this.cd.detectChanges();
    });
  }

  cancel() {
    this.ref.close();
  }
}
