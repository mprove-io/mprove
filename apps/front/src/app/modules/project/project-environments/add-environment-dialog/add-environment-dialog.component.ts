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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ToBackendCreateEnvOutput } from '#common/types/backend/routes/envs/create-env/create-env-output';
import type { ToBackendCreateEnvRequest } from '#common/types/backend/routes/envs/create-env/create-env-request';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '#front/app/queries/environments.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';
import { SpinnerService } from '#front/app/services/spinner.service';

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

  addEnvironmentForm: FormGroup<{
    envId: FormControl<string>;
  }>;

  constructor(
    private spinnerService: SpinnerService,
    public ref: DialogRef<AddEnvironmentDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvironmentForm = this.fb.group({
      envId: this.fb.control<string>(undefined, [
        Validators.required,
        Validators.maxLength(255)
      ])
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

    let payload: ToBackendCreateEnvRequest['input'] = {
      projectId: this.dataItem.projectId,
      envId: this.addEnvironmentForm.value.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateEnv',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateEnvOutput = resp.output;

          this.memberQuery.update(output.userMember);

          this.environmentsQuery.update({
            environments: output.envs
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
