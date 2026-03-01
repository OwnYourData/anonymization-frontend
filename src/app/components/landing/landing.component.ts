import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Technique = 'masking' | 'generalization' | 'randomization' | 'unchanged';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './landing.component.html',
    styleUrls: [
        './landing-variables.css',
        './landing-header.css',
        './landing-buttons.css',
        './landing-hero.css',
        './landing-sections.css',
        './landing-try-it.css',
        './landing-faq.css',
        './landing-footer.css',
        './landing-responsive.css'
    ]
})
export class LandingComponent implements OnInit, OnDestroy {

    ngOnInit(): void {
        document.body.classList.add('dark-landing');
    }

    ngOnDestroy(): void {
        document.body.classList.remove('dark-landing');
    }

    // Interactive example — input fields
    inputName = 'David Miller';
    inputAge = 34;
    inputAddress = '125 Deep Water Ct, New London, NC 28127';
    inputDiagnosis = 'Flu';

    // Technique selectors
    techName: Technique = 'masking';
    techAge: Technique = 'randomization';
    techAddress: Technique = 'generalization';

    // Animation flag
    outputAnimating = false;

    // ── Computed anonymized outputs ──

    get outputName(): string {
        switch (this.techName) {
            case 'masking':
                return '*****';
            default:
                return this.inputName;
        }
    }

    get outputAge(): string {
        const age = Number(this.inputAge) || 0;
        switch (this.techAge) {
            case 'masking':
                return '**';
            case 'generalization': {
                const decade = Math.floor(age / 10) * 10;
                return `${decade}–${decade + 10}`;
            }
            case 'randomization': {
                const offset = Math.floor(Math.random() * 5) + 1;
                const sign = Math.random() > 0.5 ? 1 : -1;
                return String(Math.max(0, age + sign * offset));
            }
            default:
                return String(age);
        }
    }

    get outputAddress(): string {
        switch (this.techAddress) {
            case 'masking':
                return '*****';
            case 'generalization':
                return this.extractState(this.inputAddress);
            default:
                return this.inputAddress;
        }
    }

    get outputDiagnosis(): string {
        return this.inputDiagnosis;
    }

    // ── Anonymize button handler ──

    onAnonymize(): void {
        this.outputAnimating = true;
        setTimeout(() => this.outputAnimating = false, 600);
    }

    // ── Helpers ──

    private extractState(address: string): string {
        // Match a US state abbreviation (two uppercase letters) in the address
        const stateMatch = address.match(/\b([A-Z]{2})\b/);
        if (stateMatch) {
            return stateMatch[1];
        }
        // Fallback: return the last comma-separated segment, stripped of digits
        const parts = address.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const cleaned = parts[parts.length - 1].replace(/\d+/g, '').trim();
            return cleaned || parts[parts.length - 1];
        }
        return address;
    }
}
