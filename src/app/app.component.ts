import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SubdomainService } from './services/subdomain.service';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public subdomainService: SubdomainService) {}
}
