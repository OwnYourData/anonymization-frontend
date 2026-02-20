import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class LandingComponent {
    showStickyCta = false;

    @HostListener('window:scroll')
    onScroll(): void {
        // Show sticky CTA after scrolling past ~400px (roughly the hero height)
        this.showStickyCta = window.scrollY > 400;
    }
}
