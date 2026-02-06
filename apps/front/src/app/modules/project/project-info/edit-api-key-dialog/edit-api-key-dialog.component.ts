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
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditApiKeyDialogData {
  apiService: ApiService;
  projectId: string;
  keyLabel: string;
  fieldName: 'zenApiKey' | 'e2bApiKey';
}

@Component({
  selector: 'm-edit-api-key-dialog',
  templateUrl: './edit-api-key-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, ReactiveFormsModule]
})
export class EditApiKeyDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('apiKeyInput') apiKeyInputElement: ElementRef;

  editApiKeyForm: FormGroup;

  constructor(
    public ref: DialogRef<EditApiKeyDialogData>,
    private fb: FormBuilder,
    private projectQuery: ProjectQuery
  ) {}

  ngOnInit() {
    this.editApiKeyForm = this.fb.group({
      apiKey: ['', [Validators.maxLength(1000)]]
    });

    setTimeout(() => {
      this.apiKeyInputElement.nativeElement.focus();
    }, 0);
  }

  save() {
    this.editApiKeyForm.markAllAsTouched();

    if (!this.editApiKeyForm.valid) {
      return;
    }

    let value = this.editApiKeyForm.value.apiKey;
    if (!value || value.trim() === '') {
      return;
    }

    this.ref.close();

    let payload: ToBackendSetProjectInfoRequestPayload = {
      projectId: this.ref.data.projectId,
      [this.ref.data.fieldName]: value.trim()
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
            this.projectQuery.update(resp.payload.project);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteKey() {
    this.ref.close();

    let payload: ToBackendSetProjectInfoRequestPayload = {
      projectId: this.ref.data.projectId,
      [this.ref.data.fieldName]: ''
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
            this.projectQuery.update(resp.payload.project);
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
