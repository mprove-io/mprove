import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PATH_PROJECT_DELETED } from '#common/constants/top';
import { LOCAL_STORAGE_DELETED_PROJECT_NAME } from '#common/constants/top-front';
import type { ToBackendDeleteProjectRequest } from '#common/types/backend/routes/projects/delete-project/delete-project-request';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

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
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<DeleteProjectDialogData>,
    private router: Router,
    private projectQuery: ProjectQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteProjectRequest['input'] = {
      projectId: this.ref.data.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteProject',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          localStorage.setItem(
            LOCAL_STORAGE_DELETED_PROJECT_NAME,
            this.ref.data.projectName
          );
          this.router.navigate([PATH_PROJECT_DELETED]);
          this.navQuery.clearProjectAndDeps();
          this.projectQuery.reset();
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
