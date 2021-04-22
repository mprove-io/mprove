import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { base64ToFile } from 'ngx-image-cropper';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-edit-photo-dialog',
  templateUrl: './edit-photo-dialog.component.html'
})
export class EditPhotoDialogComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;

  constructor(public ref: DialogRef, private navStore: NavStore) {}

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: any) {
    this.croppedImage = event.base64;
    console.log(event, base64ToFile(event.base64));
  }

  imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: any) {
    console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  save() {
    this.ref.close();

    let payload: apiToBackend.ToBackendSetAvatarRequestPayload = {
      avatarBig: '',
      avatarSmall: this.croppedImage
    };

    let apiService: ApiService = this.ref.data.apiService;

    console.log(this.croppedImage);

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendSetAvatarResponse) => {
          console.log(resp.payload.avatarSmall);

          this.navStore.update(state =>
            Object.assign({}, state, {
              avatarSmall: resp.payload.avatarSmall
            })
          );
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
