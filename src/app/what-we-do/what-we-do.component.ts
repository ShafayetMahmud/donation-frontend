import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SubdomainService } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-what-we-do',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, AsyncPipe, TranslateModule],
  templateUrl: './what-we-do.component.html',
  styleUrls: ['./what-we-do.component.css']
})
export class WhatWeDoComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(public subdomainService: SubdomainService, private router: Router, public langService: LanguageService) {
    this.campaign$ = this.subdomainService.campaign$;
  }
}
