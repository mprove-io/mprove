import {
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
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface CreateFolderDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  parentNodeId: string;
}

@Component({
  selector: 'm-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html'
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

    let payload: apiToBackend.ToBackendCreateFolderRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      folderName: folderName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFolder,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFolderResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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
