import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-cancel-subscription-dialog',
  templateUrl: 'cancel-subscription-dialog.component.html'
})
export class CancelSubscriptionDialogComponent implements OnInit, OnDestroy {

  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  cancelSubscriptionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CancelSubscriptionDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }


  ngOnInit(): void {
    this.selectedProjectSub = this.store.select(selectors.getSelectedProject)
      .pipe(filter(v => !!v))
      .subscribe(x => this.selectedProject = x);

    this.buildForm();
  }

  ngOnDestroy() {
    this.selectedProjectSub.unsubscribe();
  }

  buildForm(): void {

    this.cancelSubscriptionForm = this.fb.group({
      'cancelMessage': [
        null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255)
        ])
      ],
    });
  }

  onSubmit(fv: any) {
    this.store.dispatch(new actions.CancelSubscriptionsAction({
      project_id: this.selectedProject.project_id,
      cancel_message: fv['cancelMessage'],
    }));
  }
}
