import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { ProjectStore } from '~front/app/stores/project.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteProjectDialogData {
  apiService: ApiService;
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'm-delete-project-dialog',
  templateUrl: './delete-project-dialog.component.html'
})
export class DeleteProjectDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteProjectDialogData>,
    private router: Router,
    private projectStore: ProjectStore,
    private spinner: NgxSpinnerService,
    private navStore: NavStore
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteProjectRequestPayload = {
      projectId: this.ref.data.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteProject,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            localStorage.setItem(
              constants.LOCAL_STORAGE_DELETED_PROJECT_NAME,
              this.ref.data.projectName
            );
            this.router.navigate([common.PATH_PROJECT_DELETED]);
            this.navStore.clearProjectAndDeps();
            this.projectStore.reset();
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
