import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-hint',
  templateUrl: 'hint.component.html',
  styleUrls: ['hint.component.scss']
})
export class HintComponent {
  constructor() {}
}
