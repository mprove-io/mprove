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
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

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
  templateUrl: './rename-file-dialog.component.html'
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

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let newName = this.renameFileForm.value.fileName;

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
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendRenameCatalogNodeResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            let fIdAr = this.ref.data.nodeId.split('/');
            fIdAr.shift();
            fIdAr.pop();
            fIdAr.push(newName);
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
