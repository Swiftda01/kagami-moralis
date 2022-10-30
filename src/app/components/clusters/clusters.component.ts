import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClusterFormComponent } from '../cluster-form/cluster-form.component';
import { MoralisService } from '../../services/moralis/moralis.service';
import { Cluster } from '../../models/cluster';

@Component({
	selector: 'clusters',
	templateUrl: './clusters.component.html',
	styleUrls: ['./clusters.component.scss']
})

export class ClustersComponent implements OnInit {

	@Input() clusters;

	displayedColumns: string[] = ['name', 'description', 'addresses'];

	constructor(
		public dialog: MatDialog,
		private moralisService: MoralisService,
	) {}

	ngOnInit(): void { }

	openEditClusterDialog(cluster) {
		const editClusterDialogRef = this.dialog.open(ClusterFormComponent);

		editClusterDialogRef.componentInstance.id = cluster.id;
		editClusterDialogRef.componentInstance.name = cluster.name;
		editClusterDialogRef.componentInstance.description = cluster.description;
		editClusterDialogRef.componentInstance.addresses = cluster.addresses;

		editClusterDialogRef.afterClosed().subscribe(result => {
			if (!result) { return; }

			const savedCluster = result.saved;
			const deletedCluster = result.deleted;

			if (savedCluster) {
				this.moralisService.updateCluster(savedCluster).then(moralisCluster => {
					cluster.name = moralisCluster.attributes.name;
					cluster.description = moralisCluster.attributes.description;
					cluster.addresses = moralisCluster.attributes.addresses;

					this.clusters = [...this.clusters];
				});
			} else if (deletedCluster) {
				this.moralisService.deleteCluster(cluster).then(moralisCluster => {
					this.clusters = this.clusters.filter(existingCluster => {
						return existingCluster.id !== moralisCluster.id;
					});
				});
			}
		});
	}

	openAddClusterDialog() {
		const addClusterDialogRef = this.dialog.open(ClusterFormComponent);

		addClusterDialogRef.afterClosed().subscribe(result => {
			if (!result) { return; }

			const savedCluster = result.saved;

			if (savedCluster) {
				this.moralisService.createCluster(savedCluster).then(moralisCluster => {
					const newCluster = new Cluster();
					newCluster.id = moralisCluster.id;
					newCluster.name = moralisCluster.attributes.name;
					newCluster.description = moralisCluster.attributes.description;
					newCluster.addresses = moralisCluster.attributes.addresses;

					this.clusters = [...this.clusters, newCluster];
				});
			}
		});
	}

}
