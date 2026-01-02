import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { LanguageService } from '../services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, AsyncPipe, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(
    public subdomainService: SubdomainService,
    private router: Router,
    public langService: LanguageService
  ) {
    this.campaign$ = this.subdomainService.campaign$;
  }

  onMissionClick() {
    this.router.navigate(['/mission']);
  }

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
