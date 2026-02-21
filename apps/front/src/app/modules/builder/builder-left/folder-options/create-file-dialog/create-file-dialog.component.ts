import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
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
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import {
  ToBackendCreateFileRequestPayload,
  ToBackendCreateFileResponse
} from '#common/interfaces/to-backend/files/to-backend-create-file';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface CreateFileDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-file-dialog',
  templateUrl: './create-file-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CreateFileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('fileName') fileNameElement: ElementRef;

  createFileForm: FormGroup;

  constructor(
    public ref: DialogRef<CreateFileDialogData>,
    private fb: FormBuilder,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let fileName: string;

    this.createFileForm = this.fb.group({
      fileName: [
        fileName,
        [
          Validators.required,
          ValidationService.lowerCaseValidator,
          Validators.maxLength(255)
        ]
      ]
    });

    setTimeout(() => {
      this.fileNameElement.nativeElement.focus();
    }, 0);
  }

  create() {
    this.createFileForm.markAllAsTouched();

    if (!this.createFileForm.valid) {
      return;
    }

    this.ref.close();

    let fileName = this.createFileForm.value.fileName;

    fileName = fileName.toLowerCase();

    let payload: ToBackendCreateFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      fileName: fileName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateFileResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            let fId = this.ref.data.parentNodeId + '/' + fileName;
            let fIdAr = fId.split('/');
            fIdAr.shift();

            let filePath = fIdAr.join('/');

            let fileId = encodeFilePath({ filePath: filePath });

            this.navigateService.navigateToFileLine({
              builderLeft: BuilderLeftEnum.Tree,
              encodedFileId: fileId
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
