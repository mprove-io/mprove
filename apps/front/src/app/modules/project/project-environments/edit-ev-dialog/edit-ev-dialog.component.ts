import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditEvDialogData {
  apiService: ApiService;
  env: common.Env;
  ev: common.Ev;
}

@Component({
  selector: 'm-edit-ev-dialog',
  templateUrl: './edit-ev-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditEvDialogData = this.ref.data;

  editEvForm: FormGroup;

  constructor(
    public ref: DialogRef<EditEvDialogData>,
    private fb: FormBuilder,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.editEvForm = this.fb.group({
      val: [
        this.dataItem.ev.val,
        [Validators.required, Validators.maxLength(255)]
      ]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  edit() {
    this.editEvForm.markAllAsTouched();

    if (!this.editEvForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendEditEvRequestPayload = {
      projectId: this.dataItem.env.projectId,
      envId: this.dataItem.env.envId,
      evId: this.dataItem.ev.evId,
      val: this.editEvForm.value.val
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditEvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environmentsState = this.environmentsQuery.getValue();

            let env = environmentsState.environments.find(
              x => x.envId === this.dataItem.env.envId
            );

            let ev = env.evs.find(x => x.evId === this.dataItem.ev.evId);

            ev.val = resp.payload.ev.val;

            env.evs = [...env.evs].sort((a, b) =>
              a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
            );

            this.environmentsQuery.update({
              environments: [...environmentsState.environments],
              total: environmentsState.total
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
