import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.css']
})
export class MissionComponent {
  constructor(private router: Router) {}

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
