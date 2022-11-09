import { Injectable } from '@angular/core';
import { Cluster } from '../../models/cluster';
import { Policy } from '../../models/policy';
import { environment } from './../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

const serverUrl = environment.server_url;
const appId = environment.app_id;
// const chain = environment.chain;
// const tokenAddress = environment.token_address;

const Moralis = require('moralis-v1');
Moralis.start({ serverUrl, appId });

@Injectable({
	providedIn: 'root'
})
export class MoralisService {
	user: any;

	constructor(private toastr: ToastrService) { }

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

	async createPolicy(policy: Policy) {
		return this._getCluster(policy.clusterId).then(moralisParentCluster => {
			const MoralisPolicy = this._moralisObject('Policy');
			const moralisPolicy = new MoralisPolicy();

			moralisPolicy.setACL(new Moralis.ACL(this.user));

			moralisPolicy.set('cluster', moralisParentCluster);
			moralisPolicy.set('type', policy.type);
			moralisPolicy.set('recipients', policy.recipients);
			moralisPolicy.set('rules', policy.rules);

			return moralisPolicy.save().then(
				(savedPolicy) => {
					console.log('New policy created with objectId: ' + savedPolicy.id);
					return savedPolicy;
				},
				(error) => {
					console.log('Failed to create new policy, with error code: ' + error.message);
				}
			);
		});

	}

	async updatePolicy(policy: Policy) {
		return this._getPolicy(policy.id).then(
			(moralisPolicy) => {
				moralisPolicy.set('type', policy.type);
				moralisPolicy.set('recipients', policy.recipients);
				moralisPolicy.set('rules', policy.rules);

				return moralisPolicy.save().then(
					(savedPolicy) => {
						console.log('Updated policy with objectId: ' + savedPolicy.id);
						return savedPolicy;
					},
					(error) => {
						console.log('Failed to update policy, with error code: ' + error.message);
					}
				);
			},
			(error) => {
				console.log('Failed to get policy, with error code: ' + error.message);
			}
		);
	}

	async deletePolicy(policy: Policy) {
		return this._getPolicy(policy.id).then(
			(moralisPolicy) => {
				return moralisPolicy.destroy().then(
					(deletedPolicy) => {
						console.log('Deleted policy with objectId: ' + deletedPolicy.id);

						return deletedPolicy;
					},
					(error) => {
						console.log('Failed to delete policy, with error code: ' + error.message);
					}
				);
			},
			(error) => {
				console.log('Failed to get policy, with error code: ' + error.message);
			}
		);
	}

	async getPolicies() {
		return this._query('Policy').find();
	}

	private async _getPolicy(policyId: string) {
		return this._query('Policy').get(policyId);
	}

	async getBreaches() {
		return this._query('Breach').find();
	}

	private _query(objectName: string) {
		return new Moralis.Query(this._moralisObject(objectName));
	}

	private _moralisObject(objectName: string) {
		return Moralis.Object.extend(objectName);
	}

	async authenticateCurrentUser() {
		await this.getCurrentUser();
		if (!this.user) {
			await Moralis.authenticate().then(
				(user) => {
					this.user = user;
				},
				(error) => {
					console.log(error);
					let errorMessage;
					if (typeof error === 'object') { errorMessage = error.message; }
					this.toastr.error(errorMessage || error);
				}
			);
		}
		this.user.setACL(new Moralis.ACL(this.user));
		return this.user;
	}

	async logOutUser() {
		Moralis.User.logOut();
	}

	async getCurrentUser() {
		this.user = await Moralis.User.current();
		return this.user;
	}
}
