import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ClusterFormComponent } from "../cluster-form/cluster-form.component";
import { MoralisV1Service } from "../../services/moralis/moralisV1.service";
import { Cluster } from "../../models/cluster";
import { Policy } from "../../models/policy";

@Component({
  selector: "clusters",
  templateUrl: "./clusters.component.html",
  styleUrls: ["./clusters.component.scss"],
})
export class ClustersComponent implements OnInit {
  @Input() clusters: Cluster[];
  @Input() policies: Policy[];

  @Output() clustersChangedEvent = new EventEmitter<Cluster[]>();

  displayedColumns: string[] = ["name", "description", "addresses"];

  constructor(
    public dialog: MatDialog,
    private moralisV1Service: MoralisV1Service,
  ) {}

  ngOnInit(): void {}

  openEditClusterDialog(cluster) {
    const clusterAddressesBeforeSave = cluster.addresses;

    const editClusterDialogRef = this.dialog.open(ClusterFormComponent, {
      panelClass: "dialog",
    });

    editClusterDialogRef.componentInstance.id = cluster.id;
    editClusterDialogRef.componentInstance.name = cluster.name;
    editClusterDialogRef.componentInstance.description = cluster.description;
    editClusterDialogRef.componentInstance.addresses = cluster.addresses;
    editClusterDialogRef.componentInstance.numPolicies =
      this._numPolicies(cluster);

    editClusterDialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const savedCluster = result.saved;
      const deletedCluster = result.deleted;

      if (savedCluster) {
        this.moralisV1Service
          .update("Cluster", cluster.id, {
            name: savedCluster.name,
            description: savedCluster.description,
            addresses: savedCluster.addresses,
          })
          .then((moralisCluster) => {
            cluster.name = moralisCluster.attributes.name;
            cluster.description = moralisCluster.attributes.description;
            cluster.addresses = moralisCluster.attributes.addresses;

            this.clusters = [...this.clusters];
            this._emitUpdatedClusters();

            this.clusterPolicies(cluster).forEach((policy) => {
              this.moralisV1Service.updateStreamAddresses(
                policy.streamId,
                clusterAddressesBeforeSave,
                cluster.addresses
              );
            });
          });
      } else if (deletedCluster) {
        this.moralisV1Service.delete("Cluster", cluster.id).then(() => {
          this.clusters = this.clusters.filter((existingCluster) => {
            return existingCluster.id !== cluster.id;
          });

          this._emitUpdatedClusters();
        });
      }
    });
  }

  openAddClusterDialog() {
    const addClusterDialogRef = this.dialog.open(ClusterFormComponent, {
      panelClass: "dialog",
    });

    addClusterDialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const savedCluster = result.saved;

      if (savedCluster) {
        this.moralisV1Service
          .create("Cluster", {
            name: savedCluster.name,
            description: savedCluster.description,
            addresses: savedCluster.addresses,
          })
          .then((moralisCluster) => {
            const newCluster = new Cluster();
            newCluster.id = moralisCluster.id;
            newCluster.name = moralisCluster.attributes.name;
            newCluster.description = moralisCluster.attributes.description;
            newCluster.addresses = moralisCluster.attributes.addresses;

            this.clusters = [...this.clusters, newCluster];
            this._emitUpdatedClusters();
          });
      }
    });
  }

  private _emitUpdatedClusters() {
    this.clustersChangedEvent.emit(this.clusters);
  }

  private _numPolicies(cluster) {
    return this.clusterPolicies(cluster).length;
  }

  private clusterPolicies(cluster) {
    return this.policies.filter((policy) => policy.clusterId === cluster.id);
  }
}
