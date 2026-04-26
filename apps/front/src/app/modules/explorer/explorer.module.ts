import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ChatModule } from '../chat/chat.module';
import { SharedModule } from '../shared/shared.module';
import { ExplorerComponent } from './explorer.component';
import { ExplorerHistoryComponent } from './explorer-history/explorer-history.component';
import { ExplorerTabsComponent } from './explorer-tabs/explorer-tabs.component';

@NgModule({
  declarations: [
    ExplorerComponent,
    ExplorerHistoryComponent,
    ExplorerTabsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ChatModule,
    RouterModule,
    TippyDirective,
    NgxSpinnerModule,
    NgScrollbarModule
  ]
})
export class ExplorerModule {}
