import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load initial images from backend (list blobs)
    // this.http.get<string[]>('https://yourapi.com/api/gallery/list-blobs')
    //   .subscribe((urls) => {
    //     this.images = urls;
    //   });
   this.http.get<string[]>(`${environment.apiBaseUrl}/gallery/list-blobs`)
  .subscribe(
    (urls) => {
      // success
      this.images = [
        ...this.images, // existing assets
        ...urls         // blobs
      ];
    },
    (error) => {
      console.error('Failed to fetch blobs', error);
    }
  );
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // const blobName = Date.now() + '-' + file.name;
      const blobName = Date.now() + '-' + file.name.replace(/\s+/g, '-');


      // Ask .NET backend for a SAS URL
      // this.http.get<{ url: string }>(`https://yourapi.com/api/gallery/get-sas?blobName=${blobName}`)
//       this.http.get<{ url: string }>(
//   `https://localhost:5001/api/gallery/get-sas?blobName=${blobName}`
// )

this.http.get<{ url: string }>(`${environment.apiBaseUrl}/gallery/get-sas?blobName=${blobName}`)


        .subscribe(async (res) => {
          // Upload directly to Azure Blob Storage
          await fetch(res.url, {
            method: 'PUT',
            headers: { 'x-ms-blob-type': 'BlockBlob' },
            body: file
          });

          // Get public URL (strip SAS token)
          const publicUrl = res.url.split('?')[0];
          this.images.push(publicUrl);
          this.currentIndex = this.images.length - 1;
        });
    }
  }

}
