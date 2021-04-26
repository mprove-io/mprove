import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { NavbarComponent } from './navbar.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

@NgModule({
  declarations: [NavbarComponent, UserMenuComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SharedModule,
    NgSelectModule
  ]
})
export class NavbarModule {}
