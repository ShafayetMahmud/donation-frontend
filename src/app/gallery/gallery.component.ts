import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../services/gallery.service';
import { SubdomainService } from '../services/subdomain.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  images: string[] = [];
  loading = true;
  error = false;
  subdomain: string | null = null;

  // Lightbox
  lightboxOpen = false;
  selectedIndex = 0;

  constructor(
    private galleryService: GalleryService,
    private subdomainService: SubdomainService,
    public langService: LanguageService
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
      next: urls => {
        this.images = urls;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  /** Lightbox controls */
  openLightbox(index: number) {
    this.selectedIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  next() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
  }

  prev() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    await this.galleryService.uploadImage(this.subdomain, file).toPromise();
    this.loadImages();
  }
}



