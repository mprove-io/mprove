// import { ImageUploadComponent } from './image-upload/image-upload.component';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnDestroy {
  url: any;
  user: api.User;

  // editUserImageDialogRef: MatDialogRef<ImageUploadComponent>;
  userSub: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    public dialog: MatDialog,
    public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('Profile');

    this.userSub = this.store.select(selectors.getUserState).pipe(
      filter(v => !!v))
      .subscribe(user => {
        this.user = user;
        this.url = configs.pathConfig.dynamicAssetsBaseUrl + this.user.picture_url_big;
      });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  // changeProfilePhoto() {
  //   this.editUserImageDialogRef = this.dialog.open(ImageUploadComponent, {
  //     disableClose: false,
  //     autoFocus: false,
  //   });
  //   this.editUserImageDialogRef.componentInstance.user = this.user;
  //   this.editUserImageDialogRef.afterClosed().subscribe(() => this.editUserImageDialogRef = null);
  // }
}
