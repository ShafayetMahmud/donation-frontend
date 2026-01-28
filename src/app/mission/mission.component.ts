import { Component } from '@angular/core';
import { SubdomainService } from '../services/subdomain.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, AsyncPipe, TranslateModule],
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(public subdomainService: SubdomainService, private router: Router, public langService: LanguageService) {
    this.campaign$ = this.subdomainService.campaign$;
  }

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
