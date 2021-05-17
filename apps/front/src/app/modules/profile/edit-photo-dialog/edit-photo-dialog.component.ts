import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-edit-photo-dialog',
  templateUrl: './edit-photo-dialog.component.html'
})
export class EditPhotoDialogComponent {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  compressedImage: any = '';
  showCropper = false;

  constructor(
    public ref: DialogRef,
    private navStore: NavStore,
    private imageCompressService: NgxImageCompressService
  ) {}

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  async imageCropped(event: any) {
    // console.log('event:', event);
    this.croppedImage = event.base64;

    let sizeBefore = this.imageCompressService.byteCount(this.croppedImage);
    // console.log('sizeBefore:', sizeBefore);

    await this.imageCompressService
      .compressFile(this.croppedImage, -2, 25, 100)
      .then(result => {
        this.compressedImage = result;

        let sizeAfter = this.imageCompressService.byteCount(
          this.compressedImage
        );
        // console.log('sizeAfter:', sizeAfter);
      });
  }

  imageLoaded() {
    this.showCropper = true;
    // console.log('Image loaded');
  }

  cropperReady(sourceImageDimensions: any) {
    // console.log('Cropper ready', sourceImageDimensions);
  }

  loadImageFailed() {
    console.log('Image load failed');
  }

  save() {
    this.ref.close();

    let payload: apiToBackend.ToBackendSetAvatarRequestPayload = {
      avatarBig: this.croppedImage,
      avatarSmall: this.compressedImage
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendSetAvatarResponse) => {
          this.navStore.update(state =>
            Object.assign({}, state, <NavState>{
              avatarSmall: resp.payload.avatarSmall,
              avatarBig: resp.payload.avatarBig
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
