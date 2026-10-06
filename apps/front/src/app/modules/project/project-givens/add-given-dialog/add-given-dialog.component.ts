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
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { UiSwitchModule } from 'ngx-ui-switch';
import { take, tap } from 'rxjs/operators';
import {
  type GivenType,
  givenTypeValues
} from '#common/types/backend/parts/given/given-type';
import type { ToBackendCreateGivenRequest } from '#common/types/backend/routes/givens/create-given/create-given-request';
import type { ToBackendCreateGivenResponse } from '#common/types/backend/routes/givens/create-given/create-given-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { GivensQuery } from '#front/app/queries/givens.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddGivenDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-given-dialog',
  templateUrl: './add-given-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    UiSwitchModule
  ]
})
export class AddGivenDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: AddGivenDialogData = this.ref.data;

  addGivenForm: FormGroup<{
    givenId: FormControl<string>;
    type: FormControl<GivenType>;
    isMultiple: FormControl<boolean>;
    values: FormControl<string>;
  }>;

  givenTypes = givenTypeValues;

  constructor(
    public ref: DialogRef<AddGivenDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private givensQuery: GivensQuery
  ) {}

  ngOnInit() {
    this.addGivenForm = this.fb.group({
      givenId: this.fb.control<string>(undefined, [
        Validators.required,
        ValidationService.givenIdWrongChars,
        Validators.maxLength(32)
      ]),
      type: this.fb.control<GivenType>('String', [Validators.required]),
      isMultiple: this.fb.control<boolean>(false),
      values: this.fb.control<string>(undefined, [
        Validators.maxLength(10000),
        ValidationService.givenValuesValidator({
          getType: () => this.addGivenForm?.controls['type'].value,
          getIsMultiple: () =>
            this.addGivenForm?.controls['isMultiple'].value === true
        })
      ])
    });

    this.addGivenForm.controls['type'].valueChanges.subscribe(() => {
      this.addGivenForm.controls['values'].updateValueAndValidity();
    });

    this.addGivenForm.controls['isMultiple'].valueChanges.subscribe(() => {
      this.addGivenForm.controls['values'].updateValueAndValidity();
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  add() {
    this.addGivenForm.markAllAsTouched();

    if (!this.addGivenForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateGivenRequest['input'] = {
      projectId: this.dataItem.projectId,
      givenId: this.addGivenForm.value.givenId,
      type: this.addGivenForm.value.type,
      isMultiple: this.addGivenForm.value.isMultiple,
      values: ValidationService.parseGivenValues({
        values: this.addGivenForm.value.values
      })
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateGiven',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateGivenResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);
            this.givensQuery.update({ givens: resp.output.givens });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }

  toggleIsMultiple() {
    this.addGivenForm.controls['isMultiple'].setValue(
      this.addGivenForm.controls['isMultiple'].value !== true
    );
  }
}
