import { Component, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly showShare = input(true);
  readonly showInfo = input(true);

  constructor(private readonly router: Router) {}

  onShare(): void {}

  onInfo(): void {
    this.router.navigate(['/more-info']);
  }
}
