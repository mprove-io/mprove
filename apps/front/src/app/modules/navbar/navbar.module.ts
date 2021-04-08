import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from './navbar.component';
import { UserMenuComponent } from './user-menu/user-menu.component';

@NgModule({
  declarations: [NavbarComponent, UserMenuComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule]
})
export class NavbarModule {}
