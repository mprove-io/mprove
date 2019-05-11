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
import { Subject } from 'rxjs';

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

  // update$: Subject<boolean> = new Subject();

  pdtsExtra: interfaces.QueryExtra[];
  pdtsExtra$ = this.store
    .select(selectors.getSelectedProjectModeRepoStructPdtsExtraOrdered)
    .pipe(
      filter(v => !!v),
      tap(pdtsExtra => {
        let nodes = [];
        let links = [];

        pdtsExtra.forEach(pdt => {
          nodes.push({
            id: pdt.pdt_id,
            label: this.removePrefix(pdt.pdt_id)
          });

          pdt.pdt_deps.forEach(x => {
            links.push({
              // id: x + '_' + pdt.pdt_id,
              source: x,
              target: pdt.pdt_id
              // label: 'is dependency of'
            });
          });
        });

        if (
          this.nodesOriginalStr !== JSON.stringify(nodes) ||
          this.linksOriginalStr !== JSON.stringify(links)
        ) {
          if (this.nodesOriginalStr !== JSON.stringify(nodes)) {
            console.log('this.nodesOriginalStr:', this.nodesOriginalStr);
            console.log('JSON.stringify(nodes):', JSON.stringify(nodes));
          }
          if (this.linksOriginalStr !== JSON.stringify(links)) {
            console.log('this.linksOriginalStr:', this.linksOriginalStr);
            console.log('JSON.stringify(links):', JSON.stringify(links));
          }

          this.nodes = nodes;
          this.links = links;

          this.nodesOriginalStr = JSON.stringify(nodes);
          this.linksOriginalStr = JSON.stringify(links);

          // this.nodes.splice(0, this.nodes.length, ...nodes);
          // this.links.splice(0, this.links.length, ...links);

          // this.update$.next(true);
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
      'from PdtsGraphComponent:',
      event
    );
    return true;
  }

  removePrefix(text) {
    return text.substring(text.indexOf('_') + 1);
  }
}
