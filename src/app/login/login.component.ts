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
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.msalService.instance.handleRedirectPromise().then((result) => {
      if (result !== null) {
        window.location.href = this.returnUrl ?? '/';
      } else {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length === 0) {
          this.msalService.loginRedirect();
        } else {
          window.location.href = this.returnUrl ?? '/';
        }
      }
    }).catch((err) => {
      console.error('MSAL login error', err);
    });
  }

  examplefunction(){
    console.log("example function called");
  }
}
