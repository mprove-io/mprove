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
  ToBackendCreateFolderRequestPayload,
  ToBackendCreateFolderResponse
} from '#common/interfaces/to-backend/folders/to-backend-create-folder';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface CreateFolderDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CreateFolderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('folderName') folderNameElement: ElementRef;

  createFolderForm: FormGroup;

  constructor(
    public ref: DialogRef<CreateFolderDialogData>,
    private fb: FormBuilder,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit() {
    let folderName: string;

    this.createFolderForm = this.fb.group({
      folderName: [
        folderName,
        [
          Validators.required,
          ValidationService.lowerCaseValidator,
          Validators.maxLength(255)
        ]
      ]
    });

    setTimeout(() => {
      this.folderNameElement.nativeElement.focus();
    }, 0);
  }

  create() {
    this.createFolderForm.markAllAsTouched();

    if (!this.createFolderForm.valid) {
      return;
    }

    this.ref.close();

    let folderName = this.createFolderForm.value.folderName.toLowerCase();

    let payload: ToBackendCreateFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      folderName: folderName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateFolderResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
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
