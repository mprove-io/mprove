import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { take, tap } from 'rxjs/operators';
import type { ToBackendSetAvatarOutput } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-output';
import type { ToBackendSetAvatarRequest } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-request';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

export interface EditPhotoDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-edit-photo-dialog',
  templateUrl: './edit-photo-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ImageCropperComponent]
})
export class EditPhotoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  compressedImage: any = '';
  showCropper = false;

  constructor(
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<EditPhotoDialogData>,
    private navQuery: NavQuery,
    private imageCompressService: NgxImageCompressService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  async imageCropped(event: any) {
    this.croppedImage = event.base64;

    let croppedImageSize = this.imageCompressService.byteCount(
      this.croppedImage
    );
    // console.log('croppedImageSize:', croppedImageSize);

    await this.imageCompressService
      .compressFile(this.croppedImage, -2, 25, 100)
      .then(result => {
        this.compressedImage = result;

        let compressedImageSize = this.imageCompressService.byteCount(
          this.compressedImage
        );
        // console.log('compressedImageSize:', compressedImageSize);
      });
  }

  imageLoaded() {
    this.showCropper = true;
  }

  cropperReady(sourceImageDimensions: any) {}

  loadImageFailed() {
    console.log('Image load failed');
  }

  save() {
    this.ref.close();

    let payload: ToBackendSetAvatarRequest['input'] = {
      avatarSmall: this.compressedImage,
      avatarBig: undefined
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendSetAvatar',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendSetAvatarOutput = resp.output;

          this.navQuery.updatePart({
            avatarSmall: output.avatarSmall,
            avatarBig: output.avatarBig
          });
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
