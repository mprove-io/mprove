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
  ToBackendCreateEnvRequestPayload,
  ToBackendCreateEnvResponse
} from '#common/interfaces/to-backend/envs/to-backend-create-env';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '#front/app/queries/environments.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';

export interface AddEnvironmentDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-environment-dialog',
  templateUrl: './add-environment-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddEnvironmentDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('envId') envIdElement: ElementRef;

  dataItem: AddEnvironmentDialogData = this.ref.data;

  addEnvironmentForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEnvironmentDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvironmentForm = this.fb.group({
      envId: [undefined, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.envIdElement.nativeElement.focus();
    }, 0);
  }

  add() {
    this.addEnvironmentForm.markAllAsTouched();

    if (!this.addEnvironmentForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.addEnvironmentForm.value.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateEnv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateEnvResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });
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
