import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PolicyFormComponent } from '../policy-form/policy-form.component';
import { MoralisService } from '../../services/moralis/moralis.service';
import { Policy } from '../../models/policy';
import { Cluster } from 'src/app/models/cluster';

@Component({
	selector: 'policies',
	templateUrl: './policies.component.html',
	styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {

	@Input() policies: Policy[];
	@Input() clusters: Cluster[];

	@Output() policiesChangedEvent = new EventEmitter<Policy[]>();

	displayedColumns: string[] = ['cluster', 'type', 'rules'];

	constructor(
		public dialog: MatDialog,
		private moralisService: MoralisService,
	) { }

	ngOnInit(): void { }

	listOf(rules) {
		return Object.entries(rules);
	}

	openEditPolicyDialog(policy) {
		const editPolicyDialogRef = this.dialog.open(PolicyFormComponent, {
			panelClass: 'dialog'
		});

		editPolicyDialogRef.componentInstance.clusters = this.clusters;
		editPolicyDialogRef.componentInstance.id = policy.id;
		editPolicyDialogRef.componentInstance.clusterId = policy.clusterId;
		editPolicyDialogRef.componentInstance.type = policy.type;
		editPolicyDialogRef.componentInstance.rules = policy.rules;
		editPolicyDialogRef.componentInstance.recipients = policy.recipients;

		editPolicyDialogRef.afterClosed().subscribe(result => {
			if (!result) { return; }

			const savedPolicy = result.saved;
			const deletedPolicy = result.deleted;

			if (savedPolicy) {
				this.moralisService.updatePolicy(savedPolicy).then(moralisPolicy => {
					policy.rules = moralisPolicy.attributes.rules;
					policy.recipients = moralisPolicy.attributes.recipients;

					this.policies = [...this.policies];
					this._emitUpdatedPolicies();
				});
			} else if (deletedPolicy) {
				this.moralisService.deletePolicy(policy).then(moralisPolicy => {
					this.policies = this.policies.filter(existingPolicy => {
						return existingPolicy.id !== moralisPolicy.id;
					});

					this._emitUpdatedPolicies();
				});
			}
		});
	}

	openAddPolicyDialog() {
		const addPolicyDialogRef = this.dialog.open(PolicyFormComponent, {
			panelClass: 'dialog'
		});

		addPolicyDialogRef.componentInstance.clusters = this.clusters;

		addPolicyDialogRef.afterClosed().subscribe(result => {
			if (!result) { return; }

			const savedPolicy = result.saved;

			if (savedPolicy) {
				this.moralisService.createPolicy(savedPolicy).then(moralisPolicy => {
					const newPolicy = new Policy();
					newPolicy.id = moralisPolicy.id;
					newPolicy.type = moralisPolicy.attributes.type;
					newPolicy.rules = moralisPolicy.attributes.rules;
					newPolicy.recipients = moralisPolicy.attributes.recipients;
					newPolicy.clusterId = moralisPolicy.attributes.cluster.id;
					newPolicy.cluster = this.clusters.find(cluster => {
						return newPolicy.clusterId === cluster.id;
					});

					this.policies = [...this.policies, newPolicy];
					this._emitUpdatedPolicies();
				});
			}
		});
	}

	private _emitUpdatedPolicies() {
		this.policiesChangedEvent.emit(this.policies);
	}

}
