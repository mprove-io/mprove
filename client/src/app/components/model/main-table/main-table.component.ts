import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges
} from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainTableComponent implements OnChanges {
  @Input()
  columns: any[] = [];

  @Input()
  filteredData: any[] = [];

  sortings: api.Sorting[] = [];
  sortings$ = this.store.select(selectors.getSelectedMconfigSortings).pipe(
    filter(v => !!v),
    tap(x => (this.sortings = x))
  );

  mConfigSelectIndex = Symbol('selected field item index');
  sortedColumns: any[] = [];

  private sortOrder: Map<string, number> = new Map([
    ['dimension', 0],
    ['measure', 1],
    ['calculation', 2]
  ]);

  constructor(
    private store: Store<interfaces.AppState>,
    private structService: services.StructService,
    private navigateService: services.NavigateService
  ) {}

  ngOnChanges(): void {
    this.sortedColumns = this.columns
      .map((item: any, index: number) =>
        Object.assign({}, item, {
          [this.mConfigSelectIndex]: index
        })
      )
      .sort((a: any, b: any) => {
        const aOrder = this.sortOrder.get(a.field_class);
        const bOrder = this.sortOrder.get(b.field_class);

        if (aOrder < bOrder) {
          return -1;
        }

        if (aOrder > bOrder) {
          return 1;
        }

        return 0;
      });
  }

  isAsc(fieldId: string) {
    let fieldSorting = this.sortings.find(s => s.field_id === fieldId);
    return fieldSorting ? !fieldSorting.desc : false;
  }

  isDesc(fieldId: string) {
    let fieldSorting = this.sortings.find(s => s.field_id === fieldId);
    return fieldSorting ? fieldSorting.desc : false;
  }

  getSortingNumber(fieldId: string) {
    let sortingIndex = this.sortings.findIndex(s => s.field_id === fieldId);
    return sortingIndex > -1 ? sortingIndex + 1 : 0;
  }

  moveLeft(index: number) {
    const toIndex: number = index - 1;
    const [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();
    const newColumnsOrder = Array.from(newMconfig.select);

    const tmp = newColumnsOrder[index];
    newColumnsOrder[index] = newColumnsOrder[toIndex];
    newColumnsOrder[toIndex] = tmp;

    newMconfig.select = newColumnsOrder;

    this.dispatchAndNavigate(newMconfig, newQuery);
  }

  moveRight(index: number) {
    const toIndex: number = index + 1;
    const [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();
    const newColumnsOrder = Array.from(newMconfig.select);

    const tmp = newColumnsOrder[index];
    newColumnsOrder[index] = newColumnsOrder[toIndex];
    newColumnsOrder[toIndex] = tmp;

    newMconfig.select = newColumnsOrder;

    this.dispatchAndNavigate(newMconfig, newQuery);
  }

  sort(fieldId: string, desc: boolean) {
    // const { fieldId, desc } = params;
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    let newSortings: api.Sorting[] = [];

    let fIndex = newMconfig.sortings.findIndex(
      sorting => sorting.field_id === fieldId
    );

    if (fIndex > -1 && newMconfig.sortings[fIndex].desc === true && desc) {
      // desc should be removed from sortings and asc should be added to end

      let sorting: api.Sorting = { field_id: fieldId, desc: false };

      newSortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1),
        sorting
      ];
    } else if (
      fIndex > -1 &&
      newMconfig.sortings[fIndex].desc === true &&
      !desc
    ) {
      // not possible in UI
      // asc should be removed from sortings

      newSortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];
    } else if (fIndex > -1 && newMconfig.sortings[fIndex].desc === false) {
      // asc should be removed from sortings
      newSortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];
    } else if (fIndex < 0) {
      // should be added to sortings
      let sorting: api.Sorting = { field_id: fieldId, desc: desc };

      newSortings = [...newMconfig.sortings, sorting];
    }

    newMconfig.sortings = newSortings;

    // create sorts
    let newSorts: string[] = [];

    newMconfig.sortings.forEach(sorting =>
      sorting.desc
        ? newSorts.push(`${sorting.field_id} desc`)
        : newSorts.push(sorting.field_id)
    );

    newMconfig.sorts =
      newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;

    this.dispatchAndNavigate(newMconfig, newQuery);
  }

  dispatchAndNavigate(newMconfig: api.Mconfig, newQuery: api.Query) {
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
