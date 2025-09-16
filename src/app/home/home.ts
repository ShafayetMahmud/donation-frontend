import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']  // plural here
})
export class Home {
  constructor(private router: Router) {}

  onDonateClick() {
    this.router.navigate(['/donate']);
  }
}
