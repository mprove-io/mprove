import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-create-project-dialog',
  templateUrl: './create-project-dialog.component.html'
})
export class CreateProjectDialogComponent implements OnInit {
  createProjectForm: FormGroup;

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    let projectName: string;

    this.createProjectForm = this.fb.group({
      projectName: [projectName, [Validators.maxLength(255)]]
    });
  }

  create() {
    this.createProjectForm.markAllAsTouched();

    if (!this.createProjectForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateProjectRequestPayload = {
      orgId: this.ref.data.orgId,
      name: this.createProjectForm.value.projectName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              common.PATH_ORG,
              resp.payload.project.orgId,
              common.PATH_PROJECT,
              resp.payload.project.projectId,
              common.PATH_SETTINGS
            ]);
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
