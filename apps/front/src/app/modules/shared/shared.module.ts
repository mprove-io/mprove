import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MonacoEditorModule } from '@sentinel-one/ngx-monaco-editor';
import { AvatarComponent } from './avatar/avatar.component';
import { FractionStringComponent } from './fraction/fraction-string/fraction-string.component';
import { FractionComponent } from './fraction/fraction.component';
import { AddIconComponent } from './icons/add-icon /add-icon.component';
import { ArrowLeftIconComponent } from './icons/arrow-left-icon/arrow-left-icon.component';
import { ArrowNarrowRightIconComponent } from './icons/arrow-narrow-right-icon/arrow-narrow-right-icon.component';
import { ArrowRightIconComponent } from './icons/arrow-right-icon/arrow-right-icon.component';
import { AscIconComponent } from './icons/asc-icon/asc-icon.component';
import { CheckIconComponent } from './icons/check-icon/check-icon.component';
import { ChevronDownIconComponent } from './icons/chevron-down-icon/chevron-down-icon.component';
import { ChevronLeftIconComponent } from './icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from './icons/chevron-right-icon/chevron-right-icon.component';
import { ChevronUpIconComponent } from './icons/chevron-up-icon/chevron-up-icon.component';
import { CurrencyDollarIconComponent } from './icons/currency-dollar-icon/currency-dollar-icon.component';
import { DeleteIconComponent } from './icons/delete-icon/delete-icon.component';
import { DescIconComponent } from './icons/desc-icon/desc-icon.component';
import { DotsVerticalIconComponent } from './icons/dots-vertical-icon/dots-vertical-icon.component';
import { ExclamationIconComponent } from './icons/exclamation-icon/exclamation-icon.component';
import { FilterIconComponent } from './icons/filter-icon/filter-icon.component';
import { FolderClosedIconComponent } from './icons/folder-closed-icon/folder-closed-icon.component';
import { FolderOpenIconComponent } from './icons/folder-open-icon/folder-open-icon.component';
import { SettingsIconComponent } from './icons/settings-icon/settings-icon.component';
import { LogoComponent } from './logo/logo.component';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { ExtensionPipe } from './pipes/extension.pipe';
import { CompletedRingComponent } from './rings/completed-ring/completed-ring.component';
import { EmailRingComponent } from './rings/email-ring/email-ring.component';
import { ValidationComponent } from './validation/validation.component';

let pipesArray = [ExtensionPipe, CapitalizePipe];

let sharedComponents = [
  LogoComponent,
  ValidationComponent,
  AvatarComponent,
  //
  CompletedRingComponent,
  EmailRingComponent,
  //
  SettingsIconComponent,
  DeleteIconComponent,
  CheckIconComponent,
  AddIconComponent,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ChevronUpIconComponent,
  ChevronDownIconComponent,
  FolderOpenIconComponent,
  FolderClosedIconComponent,
  DotsVerticalIconComponent,
  ExclamationIconComponent,
  ArrowNarrowRightIconComponent,
  ArrowLeftIconComponent,
  ArrowRightIconComponent,
  DescIconComponent,
  AscIconComponent,
  CurrencyDollarIconComponent,
  FilterIconComponent,
  FractionComponent,
  FractionStringComponent
];

@NgModule({
  declarations: [...sharedComponents, ...pipesArray],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MonacoEditorModule.forRoot(),
    FormsModule,
    NgSelectModule
  ],
  exports: [...sharedComponents, ...pipesArray, MonacoEditorModule]
})
export class SharedModule {}
