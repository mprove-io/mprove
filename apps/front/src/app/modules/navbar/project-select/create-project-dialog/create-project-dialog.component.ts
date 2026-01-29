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
  PATH_ENV,
  PATH_FILES,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendCreateProjectRequestPayload,
  ToBackendCreateProjectResponse
} from '#common/interfaces/to-backend/projects/to-backend-create-project';
import {
  ToBackendGenerateProjectRemoteKeyRequestPayload,
  ToBackendGenerateProjectRemoteKeyResponse
} from '#common/interfaces/to-backend/projects/to-backend-generate-project-remote-key';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ApiService } from '#front/app/services/api.service';

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

  projectRemoteRepoTypeEnum = ProjectRemoteTypeEnum;
  projectRemoteRepoType: ProjectRemoteTypeEnum = ProjectRemoteTypeEnum.GitClone;

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

    let payload: ToBackendGenerateProjectRemoteKeyRequestPayload = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGenerateProjectRemoteKeyResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
      this.projectRemoteRepoType === ProjectRemoteTypeEnum.GitClone &&
      !this.createProjectForm.controls['projectGitUrl'].valid
    ) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let payload: ToBackendCreateProjectRequestPayload = {
      orgId: this.ref.data.orgId,
      name: this.createProjectForm.value.projectName,
      remoteType: this.projectRemoteRepoType,
      gitUrl: this.createProjectForm.value.projectGitUrl,
      noteId: this.noteId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateProjectResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              PATH_ORG,
              resp.payload.project.orgId,
              PATH_PROJECT,
              resp.payload.project.projectId,
              PATH_REPO,
              PROD_REPO_ID,
              PATH_BRANCH,
              resp.payload.project.defaultBranch,
              PATH_ENV,
              PROJECT_ENV_PROD,
              PATH_FILES
            ]);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  managedOnClick() {
    this.projectRemoteRepoType = ProjectRemoteTypeEnum.Managed;
  }

  gitCloneOnClick() {
    this.projectRemoteRepoType = ProjectRemoteTypeEnum.GitClone;
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
