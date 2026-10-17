import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
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
import type { User } from '#common/types/backend/parts/user';
import type { ToBackendSetUserNameOutput } from '#common/types/backend/routes/users/set-user-name/set-user-name-output';
import type { ToBackendSetUserNameRequest } from '#common/types/backend/routes/users/set-user-name/set-user-name-request';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SpinnerService } from '#front/app/services/spinner.service';
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

  editNameForm: FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
  }>;

  constructor(
    private spinnerService: SpinnerService,
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
      firstName: this.fb.control<string>(firstName, [
        Validators.maxLength(255),
        Validators.required
      ]),
      lastName: this.fb.control<string>(lastName, [
        Validators.maxLength(255),
        Validators.required
      ])
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

    let payload: ToBackendSetUserNameRequest['input'] = {
      firstName: this.editNameForm.value.firstName,
      lastName: this.editNameForm.value.lastName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendSetUserName',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendSetUserNameOutput = resp.output;

          let user = output.user as User;
          this.userQuery.update(user);
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
