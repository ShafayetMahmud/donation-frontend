import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Angular Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatCardModule], // 👈 important
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  constructor(private router: Router) {}

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
