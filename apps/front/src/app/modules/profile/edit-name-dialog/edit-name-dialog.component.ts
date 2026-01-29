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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetUserNameRequestPayload,
  ToBackendSetUserNameResponse
} from '#common/interfaces/to-backend/users/to-backend-set-user-name';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../shared/shared.module';

export interface EditNameDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditNameDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  editNameForm: FormGroup;

  constructor(
    public ref: DialogRef<EditNameDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {
    let firstName: string;
    let lastName: string;

    this.userQuery
      .select()
      .pipe(
        tap(state => {
          firstName = state.firstName;
          lastName = state.lastName;
        }),
        take(1)
      )
      .subscribe();

    this.editNameForm = this.fb.group({
      firstName: [firstName, [Validators.maxLength(255), Validators.required]],
      lastName: [lastName, [Validators.maxLength(255), Validators.required]]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    this.editNameForm.markAllAsTouched();

    if (!this.editNameForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendSetUserNameRequestPayload = {
      firstName: this.editNameForm.value.firstName,
      lastName: this.editNameForm.value.lastName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetUserName,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetUserNameResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userQuery.update(user);
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
