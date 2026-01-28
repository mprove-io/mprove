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
import { PanelEnum } from '#common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import {
  ToBackendCreateFileRequestPayload,
  ToBackendCreateFileResponse
} from '#common/interfaces/to-backend/files/to-backend-create-file';
import {
  ToBackendCreateFolderRequestPayload,
  ToBackendCreateFolderResponse
} from '#common/interfaces/to-backend/folders/to-backend-create-folder';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';

export interface NewFileDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
}

@Component({
  selector: 'm-new-file-dialog',
  templateUrl: './new-file-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class NewFileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('name') nameElement: ElementRef;

  newForm: FormGroup;

  isFolder = false;

  constructor(
    public ref: DialogRef<NewFileDialogData>,
    private fb: FormBuilder,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let name: string;

    this.newForm = this.fb.group({
      name: [
        name,
        [
          Validators.required,
          ValidationService.lowerCaseValidator,
          Validators.maxLength(255)
        ]
      ]
    });
  }

  folderOnClick() {
    this.isFolder = true;
    this.cd.detectChanges();
  }

  fileOnClick() {
    this.isFolder = false;
    this.cd.detectChanges();
  }

  create() {
    this.newForm.markAllAsTouched();

    if (!this.newForm.valid) {
      return;
    }

    this.ref.close();

    let name = this.newForm.value.name;

    name = name.toLowerCase();

    let apiService: ApiService = this.ref.data.apiService;

    let struct = this.structQuery.getValue();

    let parentNodeId = struct.projectId;

    if (this.isFolder === true) {
      let payload: ToBackendCreateFolderRequestPayload = {
        projectId: this.ref.data.projectId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        parentNodeId: parentNodeId,
        folderName: name
      };

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
    } else {
      let payload: ToBackendCreateFileRequestPayload = {
        projectId: this.ref.data.projectId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        parentNodeId: parentNodeId,
        fileName: name
      };

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

              let fId = parentNodeId + '/' + name;
              let fIdAr = fId.split('/');
              fIdAr.shift();

              let filePath = fIdAr.join('/');

              let fileId = encodeFilePath({ filePath: filePath });

              this.navigateService.navigateToFileLine({
                panel: PanelEnum.Tree,
                encodedFileId: fileId
              });
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  cancel() {
    this.ref.close();
  }
}
