import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from './navbar.component';

@NgModule({
  declarations: [NavbarComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule]
})
export class NavbarModule {}
