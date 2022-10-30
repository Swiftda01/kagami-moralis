import { Injectable } from '@angular/core';
import { Cluster } from '../../models/cluster';
import { environment } from './../../../environments/environment';

const serverUrl = environment.server_url;
const appId = environment.app_id;
const chain = environment.chain;
const tokenAddress = environment.token_address;

const Moralis = require('moralis-v1');
Moralis.start({ serverUrl, appId });

@Injectable({
	providedIn: 'root'
})
export class MoralisService {
	user: any;

	constructor() { }

	async createCluster(cluster: Cluster) {
		const MoralisCluster = this._moralisObject('Cluster');
		const moralisCluster = new MoralisCluster();

		moralisCluster.setACL(new Moralis.ACL(this.user));

		moralisCluster.set('name', cluster.name);
		moralisCluster.set('description', cluster.description);
		moralisCluster.set('addresses', cluster.addresses);

		return moralisCluster.save().then(
			(savedCluster) => {
				console.log('New cluster created with objectId: ' + savedCluster.id);
				return savedCluster;
			},
			(error) => {
				console.log('Failed to create new cluster, with error code: ' + error.message);
			}
		);
	}

	async updateCluster(cluster: Cluster) {
		return this._getCluster(cluster.id).then(
			(moralisCluster) => {
				moralisCluster.set('name', cluster.name);
				moralisCluster.set('description', cluster.description);
				moralisCluster.set('addresses', cluster.addresses);

				return moralisCluster.save().then(
					(savedCluster) => {
						console.log('Updated cluster with objectId: ' + savedCluster.id);
						return savedCluster;
					},
					(error) => {
						console.log('Failed to update cluster, with error code: ' + error.message);
					}
				);
			},
			(error) => {
				console.log('Failed to get cluster, with error code: ' + error.message);
			}
		);
	}

	async deleteCluster(cluster: Cluster) {
		return this._getCluster(cluster.id).then(
			(moralisCluster) => {
				return moralisCluster.destroy().then(
					(deletedCluster) => {
						console.log('Deleted cluster with objectId: ' + deletedCluster.id);
						return deletedCluster;
					},
					(error) => {
						console.log('Failed to delete cluster, with error code: ' + error.message);
					}
				);
			},
			(error) => {
				console.log('Failed to get cluster, with error code: ' + error.message);
			}
		);
	}

	async getClusters() {
		return this._query('Cluster').find();
	}

	private async _getCluster(clusterId: string) {
		return this._query('Cluster').get(clusterId);
	}

	private _query(objectName: string) {
		return new Moralis.Query(this._moralisObject('Cluster'));
	}

	private _moralisObject(objectName: string) {
		return Moralis.Object.extend(objectName);
	}

	async authenticateCurrentUser() {
		await this.getCurrentUser();
		if (!this.user) { this.user = await Moralis.authenticate(); }
		this.user.setACL(new Moralis.ACL(this.user));
		return this.user;
	}

	async logOutUser() {
		await Moralis.User.logOut();
	}

	async getCurrentUser() {
		this.user = await Moralis.User.current();
		return this.user;
	}
}
