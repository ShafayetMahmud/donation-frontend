import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: true,
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {
  images: string[] = [
    'assets/photos/1.jpg',
    'assets/photos/2.jpg',
    'assets/photos/3.JPG',
    'assets/photos/4.jpg',
    'assets/photos/5.JPG',
    'assets/photos/6.JPG',
    'assets/photos/7.jpg',
    'assets/photos/8.jpg',
    'assets/photos/9.jpg',
    'assets/photos/10.jpg',
    'assets/photos/11.jpg',
    'assets/photos/12.jpg',
    'assets/photos/13.JPG',
    'assets/photos/14.JPG',
    'assets/photos/15.JPG',
    'assets/photos/16.JPG',
    'assets/photos/17.JPG',
    'assets/photos/18.jpg',
    'assets/photos/19.jpg',
    'assets/photos/20.jpg',
    'assets/photos/21.jpg',
    'assets/photos/22.jpg',
    'assets/photos/23.jpg',
    'assets/photos/24.jpg',
    'assets/photos/25.JPG',
    'assets/photos/26.jpg',
  ];

  currentIndex: number = 0;

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }
}
