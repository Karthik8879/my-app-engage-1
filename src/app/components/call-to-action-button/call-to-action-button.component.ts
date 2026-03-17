import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-call-to-action-button',
  standalone: true,
  imports: [],
  templateUrl: './call-to-action-button.component.html',
  styleUrl: './call-to-action-button.component.css',
})
export class CallToActionButtonComponent {
  label = input.required<string>();
  click = output<void>();

  onClick(): void {
    this.click.emit();
  }
}
