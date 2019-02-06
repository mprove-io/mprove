import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Component({
  selector: 'm-nav-models',
  templateUrl: 'nav-models.component.html',
  styleUrls: ['nav-models.component.scss']
})
export class NavModelsComponent {
  selectedModel: api.Model;
  selectedModel$ = this.store
    .select(selectors.getSelectedProjectModeRepoModel)
    .pipe(
      // no filter
      tap(x => (this.selectedModel = x))
    );

  projectId: string;
  projectId$ = this.store
    .select(selectors.getLayoutProjectId)
    .pipe(tap(x => (this.projectId = x))); // no filter here

  mode: enums.LayoutModeEnum;
  mode$ = this.store.select(selectors.getLayoutMode).pipe(
    filter(v => !!v),
    tap(x => (this.mode = x))
  );

  modelsLength$ = this.store.select(
    selectors.getSelectedProjectModeRepoModelsNotHiddenLength
  ); // no filter here

  modelGroups: interfaces.ModelGroup[] = [];
  flatModels: api.Model[] = [];

  models$ = this.store
    .select(selectors.getSelectedProjectModeRepoStructModelsNotHidden)
    .pipe(
      filter(models => !!models),
      map(models =>
        models.sort((a, b) => {
          let nameA = a.label.toLowerCase();
          let nameB = b.label.toLowerCase();
          if (nameA < nameB) {
            // sort string ascending
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0; // default return value (no sorting)
        })
      ),
      tap(models => {
        let flat: api.Model[] = [];
        let modelGroupsMap: { [id: string]: api.Model[] } = {};
        let modelGroupsArray: interfaces.ModelGroup[] = [];

        models.forEach(m => {
          if (m.gr) {
            if (modelGroupsMap[m.gr]) {
              modelGroupsMap[m.gr].push(m);
            } else {
              modelGroupsMap[m.gr] = [m];
            }
          } else {
            flat.push(m);
          }
        });

        Object.keys(modelGroupsMap)
          .sort((a, b) => {
            let nameA = a.toLowerCase();
            let nameB = b.toLowerCase();
            if (nameA < nameB) {
              // sort string ascending
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0; // default return value (no sorting)
          })
          .forEach(key => {
            modelGroupsArray.push({
              gr: key,
              models: modelGroupsMap[key]
            });
          });

        this.modelGroups = modelGroupsArray;
        this.flatModels = flat;
      })
    );

  constructor(private store: Store<interfaces.AppState>) {}
}
