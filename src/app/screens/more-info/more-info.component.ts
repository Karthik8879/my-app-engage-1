import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';

interface FaqItem {
  title: string;
  body: string;
  expanded: boolean;
}

@Component({
  selector: 'app-more-info',
  standalone: true,
  imports: [ScreenContainerComponent],
  templateUrl: './more-info.component.html',
  styleUrl: './more-info.component.css',
})
export class MoreInfoComponent {
  activeTab: 'terms' | 'faqs' = 'terms';

  private static readonly FAQ_BODY =
    'Content promoting discrimination, hatred, or violence against individuals or groups is strictly prohibited.';

  readonly faqItems: FaqItem[] = [
    { title: 'No Hate Speech', body: MoreInfoComponent.FAQ_BODY, expanded: true },
    { title: 'Unable to login into my account', body: MoreInfoComponent.FAQ_BODY, expanded: false },
    { title: 'Unable to login into my account', body: MoreInfoComponent.FAQ_BODY, expanded: false },
    { title: 'Unable to login into my account', body: MoreInfoComponent.FAQ_BODY, expanded: false },
  ];

  readonly termsItems: string[] = [
    'Anyone can be a user of Fantasy who follows its rules & regulations.',
    'Users should be aware of the advantage and disadvantage of playing fantasy games, we do not forcefully encourage anybody to go for it.',
    'We do not take any guaranty to let you win any contests at Fantasy Gaming Websites.',
    'Here in both free updates and pro updates, all features are only our suggestions and our best efforts to help you out.',
    'We are not responsible for any kind of Financially or Mentally loss you suffered.',
    'The money accepted through Membership Plans from our Pro Users is neither refundable nor transferable.',
    'FantasyArena.in has rights to cancel the membership of any member due to abusive language or any other misbehave with us or our users.',
    'We are an autonomous organization and not connected with any other group or organization.',
    'Once we receive your payment to join the membership, it can take 24 hours to activate your account.',
    'Your joining fee will be neither Refundable nor Transferable at any condition.',
    "Don't try to sell/share our teams with others.",
    "Don't promote other what's app group or other websites in our group.",
  ];

  constructor(private readonly router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  setActiveTab(tab: 'terms' | 'faqs'): void {
    this.activeTab = tab;
  }

  toggleFaq(index: number): void {
    const wasExpanded = this.faqItems[index].expanded;
    this.faqItems.forEach((item, i) => {
      item.expanded = i === index ? !wasExpanded : false;
    });
  }
}
