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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetProjectInfoRequestPayload,
  ToBackendSetProjectInfoResponse
} from '#common/interfaces/to-backend/projects/to-backend-set-project-info';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { ApiService } from '~front/app/services/api.service';

export interface EditProjectNameDialogData {
  apiService: ApiService;
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'm-edit-project-name-dialog',
  templateUrl: './edit-project-name-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, ReactiveFormsModule]
})
export class EditProjectNameDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('projectName') projectNameElement: ElementRef;

  editProjectNameForm: FormGroup;

  projectId: string;

  constructor(
    public ref: DialogRef<EditProjectNameDialogData>,
    private fb: FormBuilder,
    private projectQuery: ProjectQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    this.editProjectNameForm = this.fb.group({
      projectName: [this.ref.data.projectName, [Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.projectNameElement.nativeElement.focus();
    }, 0);
  }

  save() {
    this.editProjectNameForm.markAllAsTouched();

    if (!this.editProjectNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendSetProjectInfoRequestPayload = {
      projectId: this.ref.data.projectId,
      name: this.editProjectNameForm.value.projectName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetProjectInfoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let project = resp.payload.project;
            this.projectQuery.update(project);
            this.navQuery.updatePart({
              projectId: project.projectId,
              projectName: project.name
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
