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
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface RenameFolderDialogData {
  apiService: ApiService;
  projectId: string;
  branchId: string;
  envId: string;
  nodeId: string;
  folderName: string;
}

@Component({
  selector: 'm-rename-folder-dialog',
  templateUrl: './rename-folder-dialog.component.html'
})
export class RenameFolderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('folderName') folderNameElement: ElementRef;

  renameFolderForm: FormGroup;

  constructor(
    public ref: DialogRef<RenameFolderDialogData>,
    private fb: FormBuilder,
    private navigateService: NavigateService,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery,
    private structQuery: StructQuery
  ) {}

  ngOnInit() {
    this.renameFolderForm = this.fb.group({
      folderName: [
        this.ref.data.folderName,
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

  save() {
    this.renameFolderForm.markAllAsTouched();

    if (!this.renameFolderForm.valid) {
      return;
    }

    this.ref.close();

    let newName = this.renameFolderForm.value.folderName.toLowerCase();

    let payload: apiToBackend.ToBackendRenameCatalogNodeRequestPayload = {
      projectId: this.ref.data.projectId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      nodeId: this.ref.data.nodeId,
      newName: newName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRenameCatalogNode,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRenameCatalogNodeResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.navigateService.navigateToFiles();
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
