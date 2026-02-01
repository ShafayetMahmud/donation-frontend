import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',  // <-- external HTML file
  styleUrls: ['./login.component.css']    // optional
})
export class LoginComponent implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private msalService: MsalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Automatically trigger login on page load
    this.msalService.loginPopup(environment.loginRequest).subscribe({
      next: (result) => {
        console.log('Logged in successfully', result);

        // Redirect to original subdomain after login
        if (this.returnUrl) {
          window.location.href = this.returnUrl;
        } else {
          window.location.href = '/';
        }
      },
      error: (error) => console.error('Login error', error)
    });
  }
}
