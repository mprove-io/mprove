import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-model-filters',
  templateUrl: 'model-filters.component.html',
  styleUrls: ['model-filters.component.scss']
})
export class ModelFiltersComponent {
  fields: api.ModelField[];
  fields$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelFields)
    .pipe(
      filter(v => !!v),
      tap(x => (this.fields = x))
    );

  filters: api.Filter[] = [];
  filters$ = this.store.select(selectors.getSelectedMconfigFilters).pipe(
    filter(v => !!v),
    tap(x => (this.filters = JSON.parse(JSON.stringify(x))))
  );

  constructor(
    private store: Store<interfaces.AppState>,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private structService: services.StructService,
    private navigateService: services.NavigateService
  ) {}

  getOrAndFractions(filt: api.Filter): api.Fraction[] {
    return [
      ...filt.fractions.filter(
        fraction => fraction.operator === api.FractionOperatorEnum.Or
      ),
      ...filt.fractions.filter(
        fraction => fraction.operator === api.FractionOperatorEnum.And
      )
    ];
  }

  getFieldTopLabel(fieldId: string) {
    let fieldIndex = this.fields.findIndex(field => field.id === fieldId);
    return this.fields[fieldIndex].top_label;
  }

  getFieldLabel(fieldId: string) {
    let fieldIndex = this.fields.findIndex(field => field.id === fieldId);

    return this.fields[fieldIndex].group_label
      ? this.fields[fieldIndex].group_label +
          ' ' +
          this.fields[fieldIndex].label
      : this.fields[fieldIndex].label;
  }

  getFieldResult(fieldId: string) {
    let fieldIndex = this.fields.findIndex(field => field.id === fieldId);
    return this.fields[fieldIndex].result;
  }

  deleteFraction(filt: api.Filter, filterIndex: number, fractionIndex: number) {
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    if (filt.fractions.length === 1) {
      // should remove filter
      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    } else {
      // should remove fraction
      let fractions = this.getOrAndFractions(filt);

      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newFilter = Object.assign({}, filt, {
        fractions: newFractions
      });

      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        newFilter,
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    }

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    );

    setTimeout(
      () =>
        this.navigateService.navigateSwitch(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  addFraction(filt: api.Filter, filterIndex: number) {
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    let fractions = this.getOrAndFractions(filt);

    let fraction = this.structService.generateEmptyFraction();

    let newFractions = [...fractions, fraction];

    let newFilter = Object.assign({}, filt, {
      fractions: newFractions
    });

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    );

    setTimeout(
      () =>
        this.navigateService.navigateSwitch(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  updateFraction(
    filt: api.Filter,
    filterIndex: number,
    event: interfaces.FractionUpdate
  ) {
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    let fractions = this.getOrAndFractions(filt);

    let newFractions = [
      ...fractions.slice(0, event.fractionIndex),
      event.fraction,
      ...fractions.slice(event.fractionIndex + 1)
    ];

    let newFilter = Object.assign({}, filt, {
      fractions: newFractions
    });

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    ); //

    setTimeout(
      () =>
        this.navigateService.navigateSwitch(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  fractionHasDuplicates(filt: api.Filter, fraction: api.Fraction) {
    let hasDuplicates = false;

    if (filt.fractions.filter(x => x.brick === fraction.brick).length > 1) {
      hasDuplicates = true;
    }

    return hasDuplicates;
  }
}
