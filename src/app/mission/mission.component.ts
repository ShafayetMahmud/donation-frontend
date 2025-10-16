import { Component } from '@angular/core';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(public subdomainService: SubdomainService, private router: Router) {
    this.campaign$ = this.subdomainService.campaign$;
  }

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
