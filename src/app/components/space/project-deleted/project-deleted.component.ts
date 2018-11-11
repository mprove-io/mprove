import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as actions from 'src/app/store/actions/_index';
import * as constants from 'src/app/constants/_index';
import * as interfaces from 'src/app/interfaces/_index';

@Component({
  selector: 'm-project-deleted',
  templateUrl: './project-deleted.component.html',
})

export class ProjectDeletedComponent implements OnInit {

  constructor(private store: Store<interfaces.AppState>) {

  }

  ngOnInit() {
    this.store.dispatch(new actions.UpdateLayoutProjectIdAction(constants.DEMO));
  }
}
