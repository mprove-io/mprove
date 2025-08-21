import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
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
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { PanelEnum } from '~common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { decodeFilePath } from '~common/functions/decode-file-path';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendRenameCatalogNodeRequestPayload,
  ToBackendRenameCatalogNodeResponse
} from '~common/interfaces/to-backend/catalogs/to-backend-rename-catalog-node';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';

export interface RenameFileDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  nodeId: string;
  fileName: string;
}

@Component({
  selector: 'm-rename-file-dialog',
  templateUrl: './rename-file-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class RenameFileDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('fileName') fileNameElement: ElementRef;

  renameFileForm: FormGroup;

  constructor(
    public ref: DialogRef<RenameFileDialogData>,
    private fb: FormBuilder,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery,
    private fileQuery: FileQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private structQuery: StructQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let nameArray = this.ref.data.fileName.split('.');
    if (nameArray.length > 1) {
      nameArray.pop();
    }

    this.renameFileForm = this.fb.group({
      fileName: [
        this.ref.data.fileName,
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

  save() {
    this.renameFileForm.markAllAsTouched();

    if (!this.renameFileForm.valid) {
      return;
    }

    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let newName = this.renameFileForm.value.fileName;

    let isNavigateNewFile = false;
    let selectedFileId = this.fileQuery.getValue().fileId;

    if (isDefined(selectedFileId)) {
      let selectedPath = decodeFilePath({ filePath: selectedFileId });

      let fromPath = this.ref.data.nodeId.split('/').slice(1).join('/');

      if (selectedPath === fromPath) {
        isNavigateNewFile = true;
      }
    }

    let isRenameSecondFile = false;
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    if (isDefined(secondFileNodeId)) {
      if (secondFileNodeId === this.ref.data.nodeId) {
        isRenameSecondFile = true;
      }
    }

    let payload: ToBackendRenameCatalogNodeRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      nodeId: this.ref.data.nodeId,
      newName: newName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendRenameCatalogNodeResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (isRenameSecondFile === true) {
              let sfIdAr = this.ref.data.nodeId.split('/');
              sfIdAr.pop();
              sfIdAr.push(newName);
              let newSecondFileNodeId = sfIdAr.join('/');
              this.uiQuery.updatePart({
                secondFileNodeId: newSecondFileNodeId
              });
            }

            if (isNavigateNewFile === true) {
              let fIdAr = this.ref.data.nodeId.split('/');
              fIdAr.shift();
              fIdAr.pop();
              fIdAr.push(newName);

              let filePath = fIdAr.join('/');

              let fileId = encodeFilePath({ filePath: filePath });

              this.navigateService.navigateToFileLine({
                panel: PanelEnum.Tree,
                encodedFileId: fileId
              });
            }
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
