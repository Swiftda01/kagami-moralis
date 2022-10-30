import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MoralisService } from '../../services/moralis/moralis.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Cluster } from '../../models/cluster';

@Component({
	selector: 'dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, AfterViewInit {
	@ViewChild(MatSidenav)
	sidenav!: MatSidenav;
	segment = 'main';

	public user: any;
	public walletAddress: string;
	public shortenedWalletAddress: string;
	public nfts: any = [];
	public clusters: Cluster[];
	public policies: [];
	public data: any = {
		clusters: [
			{
				addresses: [
					'0x7560CBE62147199a7948bcB79770dE071B5725bc',
					'0x8D87669BeA71E1722e53bb1B9e4e2F01fC4EfEC0'
				],
				name: 'Cluster1',
				description: 'Test description'
			}
		],
		policies: [
			{
				id: 1,
				clusterName: 'Cluster1',
				description: {
					minMax: 'Maximum',
					amount: 0.05,
					per: 'Transaction'
				},
				recipients: ['os5ouR356Bz@proton.me'],
				type: 'Limits'
			},
			{
				id: 2,
				clusterName: 'Cluster1',
				description: {
					minMax: 'Minimum',
					amount: 1,
					per: 'Day'
				},
				recipients: ['os5ouR356Bz@proton.me'],
				type: 'Limits'
			},
			{
				id: 3,
				clusterName: 'Cluster1',
				description: {
					minMax: 'Maximum',
					amount: 3,
					per: 'Week'
				},
				recipients: ['os5ouR356Bz@proton.me'],
				type: 'Limits'
			}
		]
	};

	constructor(
		private moralisService: MoralisService,
		private observer: BreakpointObserver,
		private router: Router
	) { }

	ngAfterViewInit() {
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

	ngOnInit() {
		this._initializeComponent();
	}

	openSegment(segmentName: 'main') {
		this.segment = segmentName;
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
