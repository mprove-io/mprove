import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import { tap } from 'rxjs/operators';
import { ProjectWeekStartEnum } from 'app/api/_index';

@Component({
  moduleId: module.id,
  selector: 'm-update-week-start',
  templateUrl: 'update-week-start.component.html'
})
export class UpdateWeekStartComponent implements OnInit {
  projectWeekStart: ProjectWeekStartEnum;
  projectWeekStart$ = this.store
    .select(selectors.getSelectedProjectWeekStart)
    .pipe(
      tap(x => {
        this.projectWeekStart = x;
        this.updateProjectWeekStartForm.patchValue({
          projectWeekStart: this.projectWeekStart
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
  updateProjectWeekStartForm: FormGroup = null;

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>
  ) {}

  weekStartEnumKeys(): string[] {
    return Object.keys(api.ProjectWeekStartEnum).filter(
      item => !/^[A-Z].*$/.test(item)
    );
  }

  ngOnInit(): void {
    this.buildForm();
    this.checkForm();
  }

  buildForm() {
    this.updateProjectWeekStartForm = this.fb.group({
      projectWeekStart: [
        this.projectWeekStart,
        Validators.compose([Validators.required])
      ]
    });
  }

  checkForm() {
    if (
      this.updateProjectWeekStartForm.get('projectWeekStart').value ===
      this.projectWeekStart
    ) {
      this.updateProjectWeekStartForm.markAsPristine();
    }
  }

  onSubmit(form: FormGroup, fv: any) {
    if (
      this.updateProjectWeekStartForm.get('projectWeekStart').value !==
      this.projectWeekStart
    ) {
      this.store.dispatch(
        new actions.SetProjectWeekStartAction({
          project_id: this.selectedProjectId,
          server_ts: this.selectedProjectServerTs,
          week_start: fv['projectWeekStart']
        })
      );
    } else {
      this.updateProjectWeekStartForm.markAsPristine();
    }
  }

  onReset(form: FormGroup) {
    form.patchValue({
      projectWeekStart: this.projectWeekStart
    });
    form.markAsPristine();
  }
}
