import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  onMissionClick() {
    this.router.navigate(['/mission']);
  }

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
