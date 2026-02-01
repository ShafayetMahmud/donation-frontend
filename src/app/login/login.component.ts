// src/app/login/login.component.ts
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
    // 1. Get the returnUrl query param (from subdomain)
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // 2. Trigger login via redirect (full-page)
    this.msalService.loginRedirect(environment.loginRequest);
  }
}
