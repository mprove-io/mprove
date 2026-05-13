import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SharedModule } from '../shared/shared.module';
import { ServerUsersComponent } from './server-users.component';

@NgModule({
  declarations: [ServerUsersComponent],
  imports: [CommonModule, SharedModule, NgxPaginationModule, NgScrollbarModule]
})
export class ServerUsersModule {}
