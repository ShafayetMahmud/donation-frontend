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
  if (this.subdomainService.isSubdomain()) {
    await this.authService.restoreUserOnSubdomain();
    console.log('[Auth] User restored on subdomain?', this.authService.currentUser);
  } else {
    await this.authService.restoreUserFromMsal();
    console.log('[Auth] User restored on main domain', this.authService.currentUser);
  }
}

}
