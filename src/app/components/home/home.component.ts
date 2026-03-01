import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonLdFormComponent } from '../json-ld-form/json-ld-form.component';
import { FlatJsonFormComponent } from '../flat-json-form/flat-json-form.component';
import { FurtherInfoComponent } from '../further-info/further-info.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, JsonLdFormComponent, FlatJsonFormComponent, FurtherInfoComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    activeTab: 'json-ld' | 'flat-json' = 'json-ld';

    setActiveTab(tab: 'json-ld' | 'flat-json'): void {
        this.activeTab = tab;
    }
}
