// import { Component, ViewChild, OnInit, OnDestroy, Input, ElementRef, AfterViewInit, Inject } from '@angular/core';
// import { CropperSettings, Bounds } from 'ngx-img-cropper';
// import { MatDialogRef } from '@angular/material';
// import { SetUserPictureAction } from '../../../../actions/user.actions';
// import { Store } from '@ngrx/store';
// import {
//   FormGroup,
//   FormBuilder,
//   Validators
// } from '@angular/forms';
// import { DOCUMENT } from '@angular/common';

// // jquery for crop
// import * as jcrop from 'jquery-jcrop';
// import $ from 'jquery';

// import { AppState, getUserState } from '../../../../reducers/index';
// import { User } from '../../../../swagger/model/User';
// @Component({
//   selector: 'm-image-upload',
//   styleUrls: ['./image-upload.component.scss'],
//   templateUrl: 'image-upload.component.html',
// })
// export class ImageUploadComponent {
//   @Input() user: User;

//   data: any;
//   cropperSettings: any;
//   crop: any;
//   pictureForm: FormGroup;
//   file: File;
//   reader: FileReader;
//   userSub: Subscription;
//   context: CanvasRenderingContext2D;
//   canvas: HTMLCanvasElement;
//   canvasCroppedImage: HTMLCanvasElement;
//   contextCroppedImage: CanvasRenderingContext2D;
//   croppedCoords: any;
//   angle: number = 0;
//   image: HTMLImageElement;
//   mirrorCanvasImage: HTMLCanvasElement;
//   mirrorContextImage: CanvasRenderingContext2D;
//   dialogElement: HTMLElement;

//   @ViewChild('imagePlace') imagePlace: any;
//   @ViewChild('imagePlaceCropper') imagePlaceCropper: any;
//   @ViewChild('singleFileUpload') singleFileUpload: any;

//   constructor(
//     public dialogRef: MatDialogRef<ImageUploadComponent>,
//     private fb: FormBuilder,
//     private store: Store<AppState>,
//     private elementRef: ElementRef,
//     @Inject(DOCUMENT) private document: any
//   ) {
//     this.cropperSettings = new CropperSettings();
//     this.cropperSettings.noFileInput = true;
//     this.data = {};
//     this.pictureForm = this.fb.group({
//       picture: ''
//     });
//   }

//   fileChangeListener($event: any) {
//     this.image = new Image();
//     this.file = $event;
//     this.reader = new FileReader();
//     this.reader.onloadend = (loadEvent: any) => {
//       this.createContext();
//       this.createCroppedContext();
//       this.image.src = loadEvent.target.result;
//       this.image.onload = () => {
//         this.drawImage();
//       };
//     };
//     this.reader.onerror = (error: any) => {
//       console.error(error);
//     };
//     this.reader.readAsDataURL(this.file);
//   }

//   createCanvasContext() {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     canvas.setAttribute('id', 'canvas');
//     return {
//       canvas,
//       context
//     };
//   }

//   drawMirrorImage() {
//     let angleInRadians = this.angle * Math.PI / 180;
//     this.createMirrorContext();
//     this.mirrorCanvasImage.width =
//       Math.abs(this.image.width * Math.cos(angleInRadians)) + Math.abs(this.image.height * Math.sin(angleInRadians));

//     this.mirrorCanvasImage.height =
//       Math.abs(this.image.height * Math.cos(angleInRadians)) + Math.abs(this.image.width * Math.sin(angleInRadians));

//     this.mirrorContextImage.translate(this.mirrorCanvasImage.width / 2, this.mirrorCanvasImage.height / 2);

//     this.mirrorContextImage.rotate(angleInRadians);
//     if (this.isRotate()) {
//       this.mirrorContextImage.drawImage(
//         this.image,
//         -this.mirrorCanvasImage.height / 2,
//         -this.mirrorCanvasImage.width / 2,
//         this.image.width,
//         this.image.height);

//     } else {
//       this.mirrorContextImage.drawImage(
//         this.image,
//         -this.mirrorCanvasImage.width / 2,
//         -this.mirrorCanvasImage.height / 2,
//         this.image.width,
//         this.image.height);
//     }
//     this.contextCroppedImage.translate(0, 0);
//   }

//   createMirrorContext() {
//     const { canvas, context } = this.createCanvasContext();
//     this.mirrorCanvasImage = canvas;
//     this.mirrorContextImage = context;
//   }

//   createContext() {
//     this.deleteContext(this.imagePlace);
//     this.canvas = document.createElement('canvas');
//     this.canvas.setAttribute('id', 'canvas');
//     this.imagePlace.nativeElement.appendChild(this.canvas);
//     this.context = this.canvas.getContext('2d');
//   }

//   createCroppedContext() {
//     this.deleteContext(this.imagePlaceCropper);
//     this.canvasCroppedImage = document.createElement('canvas');
//     this.canvasCroppedImage.setAttribute('id', 'canvas-cropped');
//     this.imagePlaceCropper.nativeElement.appendChild(this.canvasCroppedImage);
//     this.contextCroppedImage = this.canvasCroppedImage.getContext('2d');
//   }

//   deleteContext(element: ElementRef) {
//     if (element.nativeElement.children.length === 0) { return; }
//     element.nativeElement.removeChild(element.nativeElement.children[0]);
//   }

//   drawImage() {
//     this.drawMirrorImage();
//     this.canvas.width = this.getScaledSize(this.image).width;
//     this.canvas.height = this.getScaledSize(this.image).height;
//     this.context.drawImage(this.mirrorCanvasImage, 0, 0, this.canvas.width, this.canvas.height);
//     this.addCrop();
//   }

//   drawCrop() {
//     let angleInRadians = this.angle * Math.PI / 180;
//     if (this.croppedCoords.w / this.calcScale() > 200) {
//       this.canvasCroppedImage.width = 200;
//       this.canvasCroppedImage.height = 200;
//     } else {
//       this.canvasCroppedImage.width = this.croppedCoords.w;
//       this.canvasCroppedImage.height = this.croppedCoords.h;
//     }

//     this.contextCroppedImage.drawImage(
//       this.mirrorCanvasImage,
//       this.croppedCoords.x / this.calcScale(),
//       this.croppedCoords.y / this.calcScale(),
//       this.croppedCoords.w / this.calcScale(),
//       this.croppedCoords.h / this.calcScale(),
//       0,
//       0,
//       this.canvasCroppedImage.width,
//       this.canvasCroppedImage.height);
//     this.contextCroppedImage.translate(0, 0);
//   }

//   getScaledSize(image: HTMLImageElement) {
//     return {
//       width: this.calcScale() * image.width,
//       height: this.calcScale() * image.height
//     };
//   }

//   calcScale() {
//     // dimensions draw container
//     const basewidth = !this.isRotate() ? 380 : 460;
//     const baseheight = !this.isRotate() ? 460 : 380;

//     if (this.image.width === this.image.height) {
//       return 360 / this.image.width;
//     }

//     if (this.image.width > this.image.height) {
//       if (basewidth > this.image.width) { return 1; }
//       return basewidth / this.image.width;
//     } else {
//       if (baseheight > this.image.height) { return 1; }
//       return baseheight / this.image.height;
//     }
//   }

//   addCrop() {
//     this.crop = jcrop($(this.canvas), {
//       aspectRatio: 1,
//       onSelect: (coords: any) => {
//         this.croppedCoords = {
//           x: Math.round(coords.x),
//           y: Math.round(coords.y),
//           w: Math.round(coords.w),
//           h: Math.round(coords.h)
//         };
//         this.drawCrop();
//       },
//       minSize: [10, 10],
//       setSelect: [0, 0, 200, 200],
//     });
//   }

//   isRotate() {
//     return Math.round(Math.cos(this.angle * Math.PI / 180)) === 0;
//   }

//   setCanvasDimensions() {
//     if (this.isRotate()) {
//       this.canvas.width = this.getScaledSize(this.image).height;
//       this.canvas.height = this.getScaledSize(this.image).width;
//     } else {
//       this.canvas.width = this.getScaledSize(this.image).width;
//       this.canvas.height = this.getScaledSize(this.image).height;
//     }
//   }

//   drawRotated() {
//     let angleInRadians = this.angle * Math.PI / 180;
//     this.context.drawImage(
//       this.mirrorCanvasImage,
//       0,
//       0,
//       this.calcScale() * this.mirrorCanvasImage.width,
//       this.calcScale() * this.mirrorCanvasImage.height);
//   }

//   rotateImage() {
//     this.angle = this.angle + 90;
//     this.drawMirrorImage();
//     this.createContext();
//     this.setCanvasDimensions();
//     this.drawRotated();
//     this.addCrop();
//     this.context.translate(0, 0);
//   }

//   applyCrop() {
//     if (!this.canvasCroppedImage) { return ''; }
//     return this.canvasCroppedImage.toDataURL();
//   }

//   cancelEvent() {
//     this.image = null;
//     this.canvas.remove();
//     this.canvasCroppedImage.remove();
//     this.canvas = null;
//     this.canvasCroppedImage = null;
//     this.crop.destroy();
//     this.image = null;
//     this.mirrorCanvasImage = null;
//     this.mirrorContextImage = null;
//   }

//   onSubmit(fv: any) {
//     this.store.dispatch(new SetUserPictureAction(
//       {
//         picture_content: this.applyCrop(),
//         server_ts: this.user.server_ts,
//       })
//     );
//   }
// }

