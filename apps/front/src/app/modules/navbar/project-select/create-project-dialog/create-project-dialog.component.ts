import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface CreateProjectDialogData {
  apiService: ApiService;
  orgId: string;
}

@Component({
  selector: 'm-create-project-dialog',
  templateUrl: './create-project-dialog.component.html'
})
export class CreateProjectDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  createProjectForm: FormGroup;

  projectRemoteRepoTypeEnum = common.ProjectRemoteTypeEnum;
  projectRemoteRepoType: common.ProjectRemoteTypeEnum =
    common.ProjectRemoteTypeEnum.GitClone;

  noteId: string;
  publicKey: string;

  isDeployKeyAdded = false;

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
        [Validators.required, Validators.maxLength(255)]
      ]
    });

    let payload: apiToBackend.ToBackendGenerateProjectRemoteKeyRequestPayload =
      {
        orgId: this.ref.data.orgId
      };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendGenerateProjectRemoteKey,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGenerateProjectRemoteKeyResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.noteId = resp.payload.noteId;
            this.publicKey = resp.payload.publicKey;

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
      this.projectRemoteRepoType === common.ProjectRemoteTypeEnum.GitClone &&
      !this.createProjectForm.controls['projectGitUrl'].valid
    ) {
      return;
    }

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateProjectRequestPayload = {
      orgId: this.ref.data.orgId,
      name: this.createProjectForm.value.projectName,
      remoteType: this.projectRemoteRepoType,
      gitUrl: this.createProjectForm.value.projectGitUrl,
      noteId: this.noteId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              common.PATH_ORG,
              resp.payload.project.orgId,
              common.PATH_PROJECT,
              resp.payload.project.projectId,
              common.PATH_REPO,
              common.PROD_REPO_ID,
              common.PATH_BRANCH,
              resp.payload.project.defaultBranch,
              common.PATH_ENV,
              common.PROJECT_ENV_PROD,
              common.PATH_FILES
            ]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  managedOnClick() {
    this.projectRemoteRepoType = common.ProjectRemoteTypeEnum.Managed;
  }

  gitCloneOnClick() {
    this.projectRemoteRepoType = common.ProjectRemoteTypeEnum.GitClone;
  }

  isDeployKeyAddedOnClick(event: any) {
    event.stopPropagation();
    this.isDeployKeyAdded = !this.isDeployKeyAdded;
    this.cd.detectChanges();
  }

  cancel() {
    this.ref.close();
  }
}
