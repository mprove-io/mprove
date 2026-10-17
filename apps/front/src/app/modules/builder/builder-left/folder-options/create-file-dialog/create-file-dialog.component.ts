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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';

import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import type { ToBackendCreateFileOutput } from '#common/types/backend/routes/files/create-file/create-file-output';
import type { ToBackendCreateFileRequest } from '#common/types/backend/routes/files/create-file/create-file-request';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { NavQuery } from '#front/app/queries/nav.query';
import { RepoQuery } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface CreateFileDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
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

  createFileForm: FormGroup<{
    fileName: FormControl<string>;
  }>;

  constructor(
    private appSpinnerService: AppSpinnerService,
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
      fileName: this.fb.control<string>(fileName, [
        Validators.required,
        ValidationService.lowerCaseValidator,
        Validators.maxLength(255)
      ])
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

    let payload: ToBackendCreateFileRequest['input'] = {
      projectId: this.ref.data.projectId,
      repoId: this.ref.data.repoId,
      branchId: this.ref.data.branchId,
      envId: this.ref.data.envId,
      parentNodeId: this.ref.data.parentNodeId,
      fileName: fileName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateFile',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateFileOutput = resp.output;

          this.repoQuery.update(output.repo);
          this.structQuery.update(output.struct);
          this.navQuery.updatePart({
            needValidate: output.needValidate
          });

          let fId = this.ref.data.parentNodeId + '/' + fileName;
          let fIdAr = fId.split('/');
          fIdAr.shift();

          let filePath = fIdAr.join('/');

          let fileId = encodeFilePath({ filePath: filePath });

          this.navigateService.navigateToFileLine({
            builderLeft: 'Tree',
            encodedFileId: fileId
          });
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
