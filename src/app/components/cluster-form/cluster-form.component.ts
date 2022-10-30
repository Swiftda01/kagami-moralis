import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Cluster } from '../../models/cluster';

@Component({
	selector: 'cluster-form',
	templateUrl: './cluster-form.component.html',
	styleUrls: ['./cluster-form.component.scss']
})
export class ClusterFormComponent implements OnInit {
	@Input() id: string;
	@Input() name: string;
	@Input() description: string;
	@Input() addresses: string[];

	cluster: Cluster;
	currentAddedAddress: string | null = null;

	displayedColumns: string[] = ['address', 'remove'];

	constructor(public dialogRef: MatDialogRef<ClusterFormComponent>) { }

	ngOnInit(): void {
		this._initializeClusterForm();
	}

	addAddress() {
		this.cluster.addresses = [...this.cluster.addresses, this.currentAddedAddress];
		this.currentAddedAddress = null;
	}

	removeAddress(address) {
		this.cluster.addresses = this.cluster.addresses.filter(existingAddress => {
			return existingAddress !== address;
		});
	}

	save() {
		const savedCluster = this.cluster.name && this.cluster.description ? this.cluster : null;
		this.dialogRef.close({ saved: savedCluster });
	}

	delete() {
		this.dialogRef.close({ deleted: true });
	}

	private _initializeClusterForm() {

		this.cluster = new Cluster();
		this.cluster.id = this.id;
		this.cluster.name = this.name;
		this.cluster.description = this.description;
		this.cluster.addresses = this.addresses || [];
	}
}
