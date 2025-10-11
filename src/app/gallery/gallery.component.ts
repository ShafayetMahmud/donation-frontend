import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { SubdomainService } from '../services/subdomain.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  images: string[] = [];
  loading = true;
  error = false;
  currentIndex = 0;
  subdomain: string | null = null;

  constructor(
    private galleryService: GalleryService,
    private subdomainService: SubdomainService
  ) {
    this.subdomain = this.subdomainService.subdomain || null;
  }

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.loading = true;
    this.error = false;
    
    this.galleryService.getGalleryImages(this.subdomain).subscribe({
      next: (urls) => {
        this.images = urls;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch images', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  nextImage() {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.images.length) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      try {
        await this.galleryService.uploadImage(this.subdomain, file).toPromise();
        this.loadImages(); // Refresh the gallery
      } catch (err) {
        console.error('Failed to upload image', err);
        // TODO: Show error message to user
      }
    }
  }

}
