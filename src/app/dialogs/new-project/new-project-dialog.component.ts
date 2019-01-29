import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import * as actions from '@app/store/actions/_index';
import * as interfaces from '@app/interfaces/_index';
import { ValidationService } from '@app/services/validation.service';

@Component({
  moduleId: module.id,
  selector: 'm-new-project-dialog',
  templateUrl: 'new-project-dialog.component.html'
})
export class NewProjectDialogComponent implements OnInit {
  newProjectForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewProjectDialogComponent>,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.newProjectForm = this.fb.group({
      projectName: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(255)
        ]),
        Validators.composeAsync([
          this.validationService.projectNameCheck.bind(this.validationService)
        ])
      ]
    });
  }

  onSubmit(fv: any) {
    this.store.dispatch(
      new actions.CreateProjectAction({
        project_id: fv['projectName']
      })
    );
  }
}
