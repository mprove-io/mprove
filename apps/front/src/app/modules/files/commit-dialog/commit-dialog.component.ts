import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
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
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { RepoQuery } from '~front/app/queries/repo.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { SharedModule } from '../../shared/shared.module';

export interface CommitDialogDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  panel: PanelEnum;
  fileId: string;
}

@Component({
  selector: 'm-commit-dialog',
  templateUrl: './commit-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CommitDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('commitMessage') commitMessageElement: ElementRef;

  commitForm: FormGroup;

  constructor(
    public ref: DialogRef<CommitDialogDialogData>,
    private fb: FormBuilder,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private fileService: FileService,
    private repoQuery: RepoQuery
  ) {}

  ngOnInit() {
    let epochTs = Math.floor(new Date().getTime() / 1000);

    this.commitForm = this.fb.group({
      message: [`c${epochTs}`, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.commitMessageElement.nativeElement.focus();
    }, 0);
  }

  commit() {
    this.commitForm.markAllAsTouched();

    if (!this.commitForm.valid) {
      return;
    }

    this.ref.close();

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendCommitRepoRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      commitMessage: this.commitForm.value.message
    };

    this.spinner.show(APP_SPINNER_NAME);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendCommitRepoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.ref.data.fileId)
            ? this.fileService.getFile({
                fileId: this.ref.data.fileId,
                panel: this.ref.data.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
