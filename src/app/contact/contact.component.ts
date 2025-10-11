import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SubdomainService, Campaign } from '../services/subdomain.service';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, AsyncPipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  public campaign$: Observable<Campaign | null>;

  constructor(private subdomainService: SubdomainService, private router: Router) {
    this.campaign$ = this.subdomainService.campaign$;
  }
}
