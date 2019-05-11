import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-pdts-graph',
  templateUrl: 'pdts-graph.component.html',
  styleUrls: ['pdts-graph.component.scss']
})
export class PdtsGraphComponent {
  nodes = [];
  nodesOriginalStr = JSON.stringify([]);
  links = [];
  linksOriginalStr = JSON.stringify([]);

  views: api.View[];
  views$ = this.store
    .select(selectors.getSelectedProjectModeRepoStructViewsSorted)
    .pipe(
      filter(v => !!v),
      tap(views => {
        let nodes = [];
        let links = [];

        views.forEach(view => {
          nodes.push({
            id: view.view_id,
            label: view.view_id
          });

          view.view_deps.forEach(x => {
            links.push({
              source: x,
              target: view.view_id
            });
          });
        });

        if (
          this.nodesOriginalStr !== JSON.stringify(nodes) ||
          this.linksOriginalStr !== JSON.stringify(links)
        ) {
          this.nodes = nodes;
          this.links = links;

          this.nodesOriginalStr = JSON.stringify(nodes);
          this.linksOriginalStr = JSON.stringify(links);

          // if (this.nodesOriginalStr !== JSON.stringify(nodes)) {
          //   console.log('this.nodesOriginalStr:', this.nodesOriginalStr);
          //   console.log('JSON.stringify(nodes):', JSON.stringify(nodes));
          // }
          // if (this.linksOriginalStr !== JSON.stringify(links)) {
          //   console.log('this.linksOriginalStr:', this.linksOriginalStr);
          //   console.log('JSON.stringify(links):', JSON.stringify(links));
          // }
        }
      })
    );

  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private myDialogService: services.MyDialogService,
    public pageTitle: services.PageTitleService
  ) {
    this.pageTitle.setProjectSubtitle('PDTs Graph');
  }

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from ViewsGraphComponent:',
      event
    );
    return true;
  }

  // removePrefix(text) {
  //   return text.substring(text.indexOf('_') + 1);
  // }
}
