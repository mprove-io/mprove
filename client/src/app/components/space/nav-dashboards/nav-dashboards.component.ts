import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as enums from '@app/enums/_index';
import * as selectors from '@app/store-selectors/_index';

@Component({
  selector: 'm-nav-dashboards',
  templateUrl: 'nav-dashboards.component.html',
  styleUrls: ['nav-dashboards.component.scss']
})
export class NavDashboardsComponent {
  selectedDashboard: api.Dashboard;
  selectedDashboard$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboard)
    .pipe(
      // no filter
      tap(x => (this.selectedDashboard = x))
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

  dashboardsLength$ = this.store.select(
    selectors.getSelectedProjectModeRepoDashboardsNotTempNotHiddenLength
  ); // no filter here

  dashboards: api.Dashboard[];
  dashboardGroups: interfaces.DashboardGroup[] = [];
  flatDashboards: api.Dashboard[] = [];

  dashboards$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardsNotTempNotHidden)
    .pipe(
      filter(dashboards => !!dashboards),
      map(dashboards =>
        dashboards.sort((a, b) => {
          let nameA = (a.title ? a.title : a.dashboard_id).toLowerCase();
          let nameB = (b.title ? b.title : b.dashboard_id).toLowerCase();
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
      tap(dashboards => {
        let flat: api.Dashboard[] = [];
        let dashboardGroupsMap: { [id: string]: api.Dashboard[] } = {};
        let dashboardGroupsArray: interfaces.DashboardGroup[] = [];

        dashboards.forEach(d => {
          if (d.gr) {
            if (dashboardGroupsMap[d.gr]) {
              dashboardGroupsMap[d.gr].push(d);
            } else {
              dashboardGroupsMap[d.gr] = [d];
            }
          } else {
            flat.push(d);
          }
        });

        Object.keys(dashboardGroupsMap)
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
            dashboardGroupsArray.push({
              gr: key,
              dashboards: dashboardGroupsMap[key]
            });
          });

        this.dashboardGroups = dashboardGroupsArray;
        this.flatDashboards = flat;
        this.dashboards = dashboards;
      })
    );

  constructor(private store: Store<interfaces.AppState>) {}

  getDashboardTitleOrName(dashboard: api.Dashboard) {
    if (dashboard) {
      return dashboard.title ? dashboard.title : dashboard.dashboard_id;
    } else {
      return '';
    }
  }
}
