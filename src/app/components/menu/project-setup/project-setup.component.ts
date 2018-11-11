import { Component, Inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-project-setup',
  templateUrl: 'project-setup.component.html',
  styleUrls: ['./project-setup.component.scss'],
})
export class ProjectSetupComponent {

  staticAssetsBaseUrl: string = configs.pathConfig.staticAssetsBaseUrl;

  layoutProjectId$ = this.store.select(selectors.getLayoutProjectId).pipe(filter(v => !!v));
  isDemo$ = this.store.select(selectors.getLayoutProjectIdIsDemo); // no filter here
  isAdmin$ = this.store.select(selectors.getSelectedProjectUserIsAdmin); // no filter here
  isEditor$ = this.store.select(selectors.getSelectedProjectUserIsEditor); // no filter here
  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here
  needSave$ = this.store.select(selectors.getLayoutNeedSave); // no filter here

  mode$ = this.store.select(selectors.getLayoutMode).pipe(filter(v => !!v));

  constructor(
    private store: Store<interfaces.AppState>,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer) {

    iconRegistry.addSvgIcon(
      'git',
      sanitizer.bypassSecurityTrustResourceUrl(this.staticAssetsBaseUrl + '/assets/app/icons/git.svg'));

    iconRegistry.addSvgIcon(
      'pdts',
      sanitizer.bypassSecurityTrustResourceUrl(this.staticAssetsBaseUrl + '/assets/app/icons/pdts.svg'));
  }
}
