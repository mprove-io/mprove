import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import { tap } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-update-query-size-limit',
  templateUrl: 'update-query-size-limit.component.html'
})
export class UpdateQuerySizeLimitComponent implements OnInit {
  querySizeLimit: number;
  querySizeLimit$ = this.store
    .select(selectors.getSelectedProjectQuerySizeLimit)
    .pipe(
      tap(x => {
        this.querySizeLimit = x;
        this.updateQuerySizeLimitForm.patchValue({
          querySizeLimit: this.querySizeLimit
        });
        this.checkForm();
      })
    );

  selectedProjectServerTs: number;
  selectedProjectServerTs$ = this.store
    .select(selectors.getSelectedProjectServerTs)
    .pipe(
      tap(x => {
        this.selectedProjectServerTs = x;
      })
    );

  selectedProjectId: string;
  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId).pipe(
    tap(x => {
      this.selectedProjectId = x;
    })
  );

  updateQuerySizeLimitForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm(): void {
    this.updateQuerySizeLimitForm = this.fb.group({
      querySizeLimit: [
        this.querySizeLimit,
        Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.maxLength(255)
        ])
      ]
    });
  }

  checkForm() {
    if (
      this.updateQuerySizeLimitForm.get('querySizeLimit').value ===
      this.querySizeLimit
    ) {
      this.updateQuerySizeLimitForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.updateQuerySizeLimitForm.get('querySizeLimit').value !==
      this.querySizeLimit
    ) {
      this.store.dispatch(
        new actions.SetProjectQuerySizeLimitAction({
          project_id: this.selectedProjectId,
          server_ts: this.selectedProjectServerTs,
          query_size_limit: fv['querySizeLimit']
        })
      );
    } else {
      this.updateQuerySizeLimitForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      querySizeLimit: this.querySizeLimit
    });
    form.markAsPristine();
  }
}
