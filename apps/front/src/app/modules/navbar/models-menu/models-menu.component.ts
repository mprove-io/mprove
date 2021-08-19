import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { MqStore } from '~front/app/stores/mq.store';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-models-menu',
  templateUrl: './models-menu.component.html'
})
export class ModelsMenuComponent implements OnInit, OnDestroy {
  isExplorer: boolean;

  pathModelId = '';

  menuId = 'modelsMenu';

  modelsList: common.ModelsItem[] = [];
  isLoading = false;
  modelsListLength = 0;

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isModelsMenuOpen = false;

  pathAccount = common.PATH_ACCOUNT;
  pathUsers = common.PATH_USERS;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[9];
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    private mqStore: MqStore,
    private router: Router,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[9];
  }

  // navigateAccount() {
  //   this.closeMenu();
  //   this.router.navigate([
  //     common.PATH_ORG,
  //     this.nav.orgId,
  //     common.PATH_ACCOUNT
  //   ]);
  // }

  // navigateUsers() {
  //   this.closeMenu();
  //   this.router.navigate([common.PATH_ORG, this.nav.orgId, common.PATH_USERS]);
  // }

  openMenu() {
    this.isModelsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });

    this.isLoading = true;

    let payload: apiToBackend.ToBackendGetModelsListRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModelsList,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendGetModelsListResponse) => {
          this.modelsList = resp.payload.modelsList;
          this.isExplorer = resp.payload.memberIsExplorer;
          this.modelsListLength = resp.payload.modelsList.length;
          this.isLoading = false;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  closeMenu() {
    this.isModelsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu() {
    if (this.isModelsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  goToModel(modelId: string) {
    this.closeMenu();
    this.mqStore.reset();
    this.navigateService.navigateToModel(modelId);
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
