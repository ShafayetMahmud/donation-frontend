import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SubdomainService } from './services/subdomain.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';

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
export class AppComponent implements OnInit {
  constructor(
    public subdomainService: SubdomainService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Initialize user after redirect login
  //   await this.authService.ensureInitialized();
  // this.authService.loadUserFromMsal();
  await this.authService.restoreUserFromMsal();
  }
}
