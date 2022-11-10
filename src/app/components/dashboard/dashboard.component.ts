import { Component, ViewChild, OnInit } from "@angular/core";
import { MoralisV1Service } from "../../services/moralis/moralisV1.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { MatSidenav } from "@angular/material/sidenav";
import { delay } from "rxjs/operators";
import { Router } from "@angular/router";
import { Cluster } from "../../models/cluster";
import { Policy } from "../../models/policy";
import { Breach } from "../../models/breach";

@Component({
  selector: "dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  segment = "clusters";

  public user: any;
  public walletAddress: string;
  public shortenedWalletAddress: string;
  public nfts: any = [];
  public clusters: Cluster[];
  public policies: Policy[];
  public breaches: Breach[];

  constructor(
    private moralisV1Service: MoralisV1Service,
    private observer: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit() {
    this._initializeComponent();
  }

  openSegment(segmentName: "clusters" | "policies" | "breaches") {
    this.segment = segmentName;
  }

  updateClusters(newClusters) {
    this.clusters = newClusters;
  }

  updatePolicies(newPolicies) {
    this.policies = newPolicies;
  }

  async logOut() {
    this.moralisV1Service.logOutUser().then(() => {
      this._goToLandingPage();
    });
  }

  private async _initializeComponent() {
    this._initializeSideNav();
    await this._authenticateCurrentUser();
    await this._getClusters();
    await this._getPolicies();
    await this._getBreaches();
    this._getOrCreateToken();
  }

  private async _authenticateCurrentUser() {
    this.moralisV1Service.authenticateCurrentUser().then((user) => {
      this.user = user;
      this.walletAddress = this.user.attributes.ethAddress;
      this.shortenedWalletAddress = this._shortened(this.walletAddress);
    });
  }

  private _shortened(address: string) {
    const addressLength = address.length;

    return (
      address.substring(0, 6) +
      "..." +
      address.substring(addressLength - 4, addressLength)
    );
  }

  private async _getClusters() {
    const moralisClusters = await this.moralisV1Service.getAll("Cluster");

    this.clusters = moralisClusters.map((moralisCluster) => {
      const cluster = new Cluster();
      cluster.id = moralisCluster.id;
      cluster.name = moralisCluster.attributes.name;
      cluster.description = moralisCluster.attributes.description;
      cluster.addresses = moralisCluster.attributes.addresses || [];
      return cluster;
    });
  }

  private async _getPolicies() {
    const moralisPolicies = await this.moralisV1Service.getAll("Policy");
    this.policies = moralisPolicies.map((moralisPolicy) => {
      const policy = new Policy();
      policy.id = moralisPolicy.id;
      policy.type = moralisPolicy.attributes.type;
      policy.rules = moralisPolicy.attributes.rules;
      policy.recipients = moralisPolicy.attributes.recipients || [];
      policy.clusterId = moralisPolicy.attributes.cluster.id;
      policy.cluster = this.clusters.find((cluster) => {
        return policy.clusterId === cluster.id;
      });
      policy.streamId = moralisPolicy.attributes.streamId;

      return policy;
    });
  }

  private async _getBreaches() {
    const moralisBreaches = await this.moralisV1Service.getAll("Breach");

    this.breaches = moralisBreaches.map((moralisBreach) => {
      const breach = new Breach();
      breach.id = moralisBreach.id;
      breach.occurredAt = moralisBreach.attributes.updatedAt;
      breach.policyId = moralisBreach.attributes.policy.id;
      breach.rules = moralisBreach.attributes.rules;
      breach.violation = moralisBreach.attributes.violation;
      breach.policy = this.policies.find((policy) => {
        return breach.policyId === policy.id;
      });

      return breach;
    });
  }

  private async _getOrCreateToken() {
    this.moralisV1Service.getOrCreateToken();
  }

  private _goToLandingPage() {
    this.router.navigate(["/landing"]);
  }

  private _initializeSideNav() {
    this.observer
      .observe(["(max-width: 800px)"])
      .pipe(delay(1))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = "over";
          this.sidenav.close();
        } else {
          this.sidenav.mode = "side";
          this.sidenav.open();
        }
      });
  }
}
