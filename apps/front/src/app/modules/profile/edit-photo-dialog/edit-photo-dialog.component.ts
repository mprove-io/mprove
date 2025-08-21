import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';
import { DialogRef } from '@ngneat/dialog';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetAvatarRequestPayload,
  ToBackendSetAvatarResponse
} from '~common/interfaces/to-backend/avatars/to-backend-set-avatar';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';

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
    public ref: DialogRef<EditPhotoDialogData>,
    private navQuery: NavQuery,
    // private sanitizer: DomSanitizer,
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
    // console.log('event:', event);
    this.croppedImage = event.base64;
    // this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);

    // let sizeBefore = this.imageCompressService.byteCount(this.croppedImage);
    // console.log('sizeBefore:', sizeBefore);

    await this.imageCompressService
      .compressFile(this.croppedImage, -2, 25, 100)
      .then(result => {
        this.compressedImage = result;

        // let sizeAfter = this.imageCompressService.byteCount(
        //   this.compressedImage
        // );
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

    let payload: ToBackendSetAvatarRequestPayload = {
      avatarBig: this.croppedImage,
      avatarSmall: this.compressedImage
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetAvatar,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetAvatarResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.navQuery.updatePart({
              avatarSmall: resp.payload.avatarSmall,
              avatarBig: resp.payload.avatarBig
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
