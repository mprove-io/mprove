import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { Given } from '#common/types/backend/parts/given';
import type { ToBackendEditGivenRequest } from '#common/types/backend/routes/givens/edit-given/edit-given-request';
import type { ToBackendEditGivenResponse } from '#common/types/backend/routes/givens/edit-given/edit-given-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { GivensQuery } from '#front/app/queries/givens.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface EditGivenDialogData {
  apiService: ApiService;
  given: Given;
}

@Component({
  selector: 'm-edit-given-dialog',
  templateUrl: './edit-given-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditGivenDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditGivenDialogData = this.ref.data;

  editGivenForm: FormGroup;

  constructor(
    public ref: DialogRef<EditGivenDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private givensQuery: GivensQuery
  ) {}

  ngOnInit() {
    this.editGivenForm = this.fb.group({
      values: [
        this.dataItem.given.values.join('\n'),
        [
          Validators.maxLength(10000),
          ValidationService.givenValuesValidator({
            getType: () => this.dataItem.given.type,
            getIsMultiple: () => this.dataItem.given.isMultiple
          })
        ]
      ]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  edit() {
    this.editGivenForm.markAllAsTouched();

    if (!this.editGivenForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendEditGivenRequest['input'] = {
      projectId: this.dataItem.given.projectId,
      givenId: this.dataItem.given.givenId,
      values: ValidationService.parseGivenValues({
        values: this.editGivenForm.value.values
      })
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendEditGiven',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditGivenResponse) => {
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
}
