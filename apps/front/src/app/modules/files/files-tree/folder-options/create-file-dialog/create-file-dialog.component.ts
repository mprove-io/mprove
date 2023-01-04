import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface CreateFileDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-file-dialog',
  templateUrl: './create-file-dialog.component.html'
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

    let payload: apiToBackend.ToBackendCreateFileRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      fileName: fileName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            let fId = this.ref.data.parentNodeId + '/' + fileName;
            let fIdAr = fId.split('/');
            fIdAr.shift();
            let fileId = fIdAr.join(common.TRIPLE_UNDERSCORE);

            this.navigateService.navigateToFileLine({
              panel: common.PanelEnum.Tree,
              underscoreFileId: fileId
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
