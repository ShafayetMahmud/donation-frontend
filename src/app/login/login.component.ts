import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private msalService: MsalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
  this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

  // Trigger login redirect
  this.msalService.loginRedirect(environment.loginRequest);

  // After returning from Azure AD, Angular will reload the app.
  // So we need to detect that and redirect properly:
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    // User just returned from Azure AD
    window.location.href = this.returnUrl ?? '/';
  }
}

//important


}
