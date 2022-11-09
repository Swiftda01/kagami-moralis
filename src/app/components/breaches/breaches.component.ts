import { Component, OnInit, Input } from '@angular/core';
import { Breach } from '../../models/breach';

@Component({
	selector: 'breaches',
	templateUrl: './breaches.component.html',
	styleUrls: ['./breaches.component.scss']
})
export class BreachesComponent implements OnInit {

	@Input() breaches: Breach[];

	displayedColumns: string[] = ['cluster', 'occurredAt', 'rules', 'violation'];

	constructor() { }

	ngOnInit(): void {
	}

	listOf(rules) {
		return Object.entries(rules);
	}

}
