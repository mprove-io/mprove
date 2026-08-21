import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendSetProjectSandboxProviderRequestPayload,
  ToBackendSetProjectSandboxProviderResponse
} from '#common/zod/to-backend/projects/to-backend-set-project-sandbox-provider';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';

export interface EditSandboxProviderDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-edit-sandbox-provider-dialog',
  templateUrl: './edit-sandbox-provider-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, ReactiveFormsModule]
})
export class EditSandboxProviderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('apiKeyInput') apiKeyInputElement: ElementRef;
  editSandboxProviderForm: FormGroup;

  constructor(
    public ref: DialogRef<EditSandboxProviderDialogData>,
    private fb: FormBuilder,
    private projectQuery: ProjectQuery
  ) {}

  ngOnInit() {
    this.editSandboxProviderForm = this.fb.group({
      apiKey: ['', [Validators.maxLength(1000)]]
    });
    setTimeout(() => this.apiKeyInputElement.nativeElement.focus(), 0);
  }

  save() {
    this.editSandboxProviderForm.markAllAsTouched();
    let value = this.editSandboxProviderForm.value.apiKey?.trim();
    if (!this.editSandboxProviderForm.valid || !value) {
      return;
    }

    this.ref.close();
    let payload: ToBackendSetProjectSandboxProviderRequestPayload = {
      projectId: this.ref.data.projectId,
      e2bApiKey: value
    };
    this.ref.data.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSetProjectSandboxProvider,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetProjectSandboxProviderResponse) => {
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
