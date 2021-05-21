import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@sentinel-one/ngx-monaco-editor';
import { AvatarComponent } from './avatar/avatar.component';
import { AddIconComponent } from './icons/add-icon /add-icon.component';
import { CheckIconComponent } from './icons/check-icon/check-icon.component';
import { ChevronDownIconComponent } from './icons/chevron-down-icon/chevron-down-icon.component';
import { ChevronRightIconComponent } from './icons/chevron-right-icon/chevron-right-icon.component';
import { DeleteIconComponent } from './icons/delete-icon/delete-icon.component';
import { DotsVerticalIconComponent } from './icons/dots-vertical-icon/dots-vertical-icon.component';
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
  ChevronDownIconComponent,
  ChevronRightIconComponent,
  FolderOpenIconComponent,
  FolderClosedIconComponent,
  DotsVerticalIconComponent
];

@NgModule({
  declarations: [...sharedComponents, ...pipesArray],
  imports: [CommonModule, ReactiveFormsModule, MonacoEditorModule.forRoot()],
  exports: [...sharedComponents, ...pipesArray, MonacoEditorModule]
})
export class SharedModule {}
