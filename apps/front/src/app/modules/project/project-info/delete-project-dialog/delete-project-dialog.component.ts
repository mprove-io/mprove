import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { PATH_PROJECT_DELETED } from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_DELETED_PROJECT_NAME
} from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendDeleteProjectRequestPayload,
  ToBackendDeleteProjectResponse
} from '#common/interfaces/to-backend/projects/to-backend-delete-project';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteProjectDialogData {
  apiService: ApiService;
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'm-delete-project-dialog',
  templateUrl: './delete-project-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteProjectDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteProjectDialogData>,
    private router: Router,
    private projectQuery: ProjectQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let payload: ToBackendDeleteProjectRequestPayload = {
      projectId: this.ref.data.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteProject,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendDeleteProjectResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            localStorage.setItem(
              LOCAL_STORAGE_DELETED_PROJECT_NAME,
              this.ref.data.projectName
            );
            this.router.navigate([PATH_PROJECT_DELETED]);
            this.navQuery.clearProjectAndDeps();
            this.projectQuery.reset();
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
