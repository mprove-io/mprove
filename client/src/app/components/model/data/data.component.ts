import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {
  limitForm: FormGroup;

  sortings: api.Sorting[] = [];
  sortings$ = this.store.select(selectors.getSelectedMconfigSortings).pipe(
    filter(v => !!v),
    tap(x => (this.sortings = x))
  );

  mconfigLimit: number;
  mconfigLimit$ = this.store.select(selectors.getSelectedMconfigLimit).pipe(
    filter(v => !!v),
    tap(x => {
      this.mconfigLimit = x;
      this.buildLimitForm();
    })
  );

  fields: api.ModelField[];
  fields$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelFields)
    .pipe(
      filter(v => !!v),
      tap(x => (this.fields = x))
    );

  data: any[] = [];
  data$ = this.store.select(selectors.getSelectedQueryData).pipe(
    map(data => {
      if (data) {
        return JSON.parse(data);
      } else {
        return [];
      }
    }),
    tap(y => {
      this.data = y;
      this.filter();
    })
  );

  mconfigSelectFields: api.ModelField[] = [];
  mconfigSelectFields$ = this.store
    .select(selectors.getSelectedMconfigSelectFields)
    .pipe(
      // no filter here
      tap(x => {
        this.mconfigSelectFields = x;
      })
    );

  filteredData: any[] = [];
  filteredTotal: number = 1;
  emptyData: boolean = false;

  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;

  constructor(
    private store: Store<interfaces.AppState>,
    private fb: FormBuilder,
    private navigateService: services.NavigateService,
    private structService: services.StructService
  ) {}

  ngOnInit(): void {
    this.buildLimitForm();
    this.filter();
  }

  buildLimitForm() {
    this.limitForm = this.fb.group({
      limit: [
        this.mconfigLimit || 500,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(1),
          Validators.max(500)
        ])
      ]
    });
  }

  limitBlur(limit: AbstractControl) {
    if (
      limit.value &&
      limit.value !== this.mconfigLimit &&
      this.limitForm.valid
    ) {
      let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

      newMconfig.limit = limit.value > 500 ? 500 : limit.value;

      this.store.dispatch(
        new actions.CreateMconfigAndQueryAction({
          api_payload: {
            mconfig: newMconfig,
            query: newQuery
          },
          navigate: () => {
            this.navigateService.navigateMconfigQueryData(
              newMconfig.mconfig_id,
              newQuery.query_id
            );
          }
        })
      );
    }
  }

  filter(): void {
    this.filteredTotal = this.data.length;
    this.filteredData = this.data;
    this.emptyData = this.data.length === 0;
  }
}
