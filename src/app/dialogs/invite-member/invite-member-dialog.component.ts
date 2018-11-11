import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-invite-member-dialog',
  templateUrl: 'invite-member-dialog.component.html'
})
export class InviteMemberDialogComponent implements OnInit, OnDestroy {

  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  inviteMemberForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<InviteMemberDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  ngOnInit() {
    this.selectedProjectSub = this.store.select(selectors.getSelectedProject)
      .pipe(filter(v => !!v))
      .subscribe(x => this.selectedProject = x);

    this.buildForm();
  }

  ngOnDestroy() {
    this.selectedProjectSub.unsubscribe();
  }

  buildForm() {
    this.inviteMemberForm = this.fb.group({
      'email': [
        null,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.maxLength(255)
        ])
      ],
    });
  }

  onSubmit(fv: any) {
    this.store.dispatch(new actions.CreateMemberAction({
      project_id: this.selectedProject.project_id,
      member_id: fv['email'],
    }));
  }
}
