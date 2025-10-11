import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  public campaign$: Observable<Campaign | null>;

  constructor(private subdomainService: SubdomainService, private router: Router) {
    this.campaign$ = this.subdomainService.campaign$;
  }

  onMissionClick() {
    this.router.navigate(['/mission']);
  }

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
