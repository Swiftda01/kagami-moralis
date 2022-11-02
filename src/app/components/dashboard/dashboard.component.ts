import { Component, ViewChild, OnInit } from '@angular/core';
import { MoralisService } from '../../services/moralis/moralis.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Cluster } from '../../models/cluster';
import { Policy } from '../../models/policy';

@Component({
	selector: 'dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
	@ViewChild(MatSidenav)
	sidenav!: MatSidenav;
	segment = 'policies';

	public user: any;
	public walletAddress: string;
	public shortenedWalletAddress: string;
	public nfts: any = [];
	public clusters: Cluster[];
	public policies: Policy[];

	constructor(
		private moralisService: MoralisService,
		private observer: BreakpointObserver,
		private router: Router
	) { }

	ngOnInit() {
		this._initializeComponent();
	}

	openSegment(segmentName: 'clusters' | 'policies') {
		this.segment = segmentName;
	}

	updateClusters(newClusters) {
		this.clusters = newClusters;
	}

	updatePolicies(newPolicies) {
		this.policies = newPolicies;
	}

	async logOut() {
		this.moralisService.logOutUser().then(() => {
			this._goToLandingPage();
		});
	}

	private async _initializeComponent() {
		this._initializeSideNav();
		await this._authenticateCurrentUser();
		await this._getClusters();
		await this._getPolicies();
	}

	private async _authenticateCurrentUser() {
		this.moralisService.authenticateCurrentUser().then(user => {
			this.user = user;
			this.walletAddress = this.user.attributes.ethAddress;
			this.shortenedWalletAddress = this._shortened(this.walletAddress);
		});
	}

	private _shortened(address: string) {
		const addressLength = address.length;

		return address.substring(0, 6) + '...' +
			address.substring(addressLength - 4, addressLength);
	}

	private async _getClusters() {
		const moralisClusters = await this.moralisService.getClusters();

		this.clusters = moralisClusters.map(moralisCluster => {
			const cluster = new Cluster();
			cluster.id = moralisCluster.id;
			cluster.name = moralisCluster.attributes.name;
			cluster.description = moralisCluster.attributes.description;
			cluster.addresses = moralisCluster.attributes.addresses || [];
			return cluster;
		});
	}

	private async _getPolicies() {
		const moralisPolicies = await this.moralisService.getPolicies();

		this.policies = moralisPolicies.map(moralisPolicy => {
			const policy = new Policy();
			policy.id = moralisPolicy.id;
			policy.type = moralisPolicy.attributes.type;
			policy.rules = moralisPolicy.attributes.rules;
			policy.recipients = moralisPolicy.attributes.recipients || [];
			policy.clusterId = moralisPolicy.attributes.cluster.id;
			policy.cluster = this.clusters.find(cluster => {
				return policy.clusterId === cluster.id;
			});

			return policy;
		});
	}

	private _goToLandingPage() {
		this.router.navigate(['/landing']);
	}

	private _initializeSideNav() {
		this.observer.observe(
			['(max-width: 800px)']
		).pipe(
			delay(1)
		).subscribe((res) => {
			if (res.matches) {
				this.sidenav.mode = 'over';
				this.sidenav.close();
			} else {
				this.sidenav.mode = 'side';
				this.sidenav.open();
			}
		});
	}

}
