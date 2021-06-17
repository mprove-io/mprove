import { Component, Input, OnDestroy } from '@angular/core';
import { TreeNode } from '@circlon/angular-tree-component';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-field-options',
  templateUrl: './field-options.component.html'
})
export class FieldOptionsComponent implements OnDestroy {
  @Input()
  node: TreeNode;

  menuId = 'fieldOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isFieldOptionsMenuOpen = false;

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public navQuery: NavQuery,
    private navigateService: NavigateService
  ) {}

  openMenu() {
    this.isFieldOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isFieldOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    if (this.isFieldOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    let fileIdAr = this.node.data.fieldFilePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: this.node.data.fieldLineNum
    });
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
