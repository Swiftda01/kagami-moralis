import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Cluster } from '../../models/cluster';
import { ToastrService } from 'ngx-toastr';

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
	@Input() numPolicies: number;

	cluster: Cluster;
	currentAddedAddress: string | null = null;

	displayedColumns: string[] = ['address', 'remove'];

	constructor(
		public dialogRef: MatDialogRef<ClusterFormComponent>,
		private toastr: ToastrService
	) { }

	ngOnInit(): void {
		this._initializeClusterForm();
	}

	addAddress() {
		if (!this.currentAddedAddress || !this._validCurrentAddedAddress()) {
			this.toastr.error('Invalid Ethereum wallet address');
			return;
		}

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
		if (this.numPolicies > 0) {
			const pluralizedTerm  = this.numPolicies === 1 ? 'policy' : 'policies';
			this.toastr.error(`You cannot delete this cluster as it has ${this.numPolicies} configured ${pluralizedTerm}`);
		} else {
			this.dialogRef.close({ deleted: true });
		}
	}

	private _validCurrentAddedAddress() {
		return /^0x[a-fA-F0-9]{40}$/.test(this.currentAddedAddress);
	}

	private _initializeClusterForm() {
		this.cluster = new Cluster();
		this.cluster.id = this.id;
		this.cluster.name = this.name;
		this.cluster.description = this.description;
		this.cluster.addresses = this.addresses || [];
	}
}
