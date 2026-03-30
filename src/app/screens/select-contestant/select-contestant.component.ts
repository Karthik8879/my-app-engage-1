import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { CallToActionButtonComponent } from '../../components/call-to-action-button/call-to-action-button.component';

export interface Contestant {
  id: number;
  name: string;
  imageSrc: string;
}

const CONTESTANTS: Contestant[] = [
  { id: 0, name: 'Ashish', imageSrc: '/Contestant.svg' },
  { id: 1, name: 'Avneet', imageSrc: '/Contestant-1.svg' },
  { id: 2, name: 'Bhuvam', imageSrc: '/Contestant-2.svg' },
  { id: 3, name: 'Dolly', imageSrc: '/Contestant-4.svg' },
  { id: 4, name: 'Harsh', imageSrc: '/Contestant-5.svg' },
  { id: 5, name: 'Jannat', imageSrc: '/Contestant-6.svg' },
  { id: 6, name: 'Karan', imageSrc: '/Contestant-7.svg' },
  { id: 7, name: 'Nisha', imageSrc: '/Contestant-10.svg' },
  { id: 8, name: 'Pooja', imageSrc: '/Contestant-11.svg' },
];

@Component({
  selector: 'app-select-contestant',
  standalone: true,
  imports: [ScreenContainerComponent, CallToActionButtonComponent],
  templateUrl: './select-contestant.component.html',
  styleUrl: './select-contestant.component.css',
})
export class SelectContestantComponent {
  readonly contestants = CONTESTANTS;
  readonly selectedContestant = signal<Contestant | null>(null);

  constructor(private readonly router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  selectContestant(contestant: Contestant): void {
    const current = this.selectedContestant();
    this.selectedContestant.set(current?.id === contestant.id ? null : contestant);
  }

  isSelected(contestant: Contestant): boolean {
    return this.selectedContestant()?.id === contestant.id;
  }

  onFollow(): void {
    const selected = this.selectedContestant();
    if (selected) {
      // TODO: wire up actual follow logic
      console.log('Following', selected.name);
    }
  }
}
