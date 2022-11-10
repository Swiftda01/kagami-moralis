import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PolicyFormComponent } from "../policy-form/policy-form.component";
import { MoralisV1Service } from "../../services/moralis/moralisV1.service";
import { Policy } from "../../models/policy";
import { Cluster } from "../../models/cluster";

@Component({
  selector: "policies",
  templateUrl: "./policies.component.html",
  styleUrls: ["./policies.component.scss"],
})
export class PoliciesComponent implements OnInit {
  @Input() policies: Policy[];
  @Input() clusters: Cluster[];

  @Output() policiesChangedEvent = new EventEmitter<Policy[]>();

  displayedColumns: string[] = ["cluster", "type", "rules"];

  constructor(
    public dialog: MatDialog,
    private moralisV1Service: MoralisV1Service,
  ) {}

  ngOnInit(): void {}

  listOf(rules) {
    return Object.entries(rules);
  }

  openEditPolicyDialog(policy) {
    const editPolicyDialogRef = this.dialog.open(PolicyFormComponent, {
      panelClass: "dialog",
    });

    editPolicyDialogRef.componentInstance.clusters = this.clusters;
    editPolicyDialogRef.componentInstance.id = policy.id;
    editPolicyDialogRef.componentInstance.clusterId = policy.clusterId;
    editPolicyDialogRef.componentInstance.type = policy.type;
    editPolicyDialogRef.componentInstance.rules = policy.rules;
    editPolicyDialogRef.componentInstance.recipients = policy.recipients;
    editPolicyDialogRef.componentInstance.streamId = policy.streamId;

    editPolicyDialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const savedPolicy = result.saved;
      const deletedPolicy = result.deleted;

      if (savedPolicy) {
        this.moralisV1Service
          .update("Policy", policy.id, {
            rules: savedPolicy.rules,
            recipients: savedPolicy.recipients,
          })
          .then((moralisPolicy) => {
            policy.rules = moralisPolicy.attributes.rules;
            policy.recipients = moralisPolicy.attributes.recipients;

            this.policies = [...this.policies];
            this._emitUpdatedPolicies();
          });
      } else if (deletedPolicy) {
        this.moralisV1Service.delete("Policy", policy.id).then(() => {
          this.policies = this.policies.filter((existingPolicy) => {
            return existingPolicy.id !== policy.id;
          });

          this._emitUpdatedPolicies();
          this.moralisV1Service.deleteStream(policy.streamId);
        });
      }
    });
  }

  openAddPolicyDialog() {
    const addPolicyDialogRef = this.dialog.open(PolicyFormComponent, {
      panelClass: "dialog",
    });

    addPolicyDialogRef.componentInstance.clusters = this.clusters;

    addPolicyDialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      const savedPolicy = result.saved;

      if (savedPolicy) {
        this.moralisV1Service
          .create(
            "Policy",
            {
              type: savedPolicy.type,
              rules: savedPolicy.rules,
              recipients: savedPolicy.recipients,
            },
            {
              Cluster: savedPolicy.clusterId,
            }
          )
          .then((moralisPolicy) => {
            const newPolicy = new Policy();
            newPolicy.id = moralisPolicy.id;
            newPolicy.type = moralisPolicy.attributes.type;
            newPolicy.rules = moralisPolicy.attributes.rules;
            newPolicy.recipients = moralisPolicy.attributes.recipients;
            newPolicy.clusterId = moralisPolicy.attributes.cluster.id;
            newPolicy.cluster = this.clusters.find((cluster) => {
              return newPolicy.clusterId === cluster.id;
            });

            this.policies = [...this.policies, newPolicy];
            this._emitUpdatedPolicies();

            // TODO: Better handliong of conditional logic for different policy types
            if (newPolicy.type === "Transaction Limit") {
              this.moralisV1Service
                .createStream(newPolicy.id, newPolicy.cluster.addresses)
                .then((streamId) => {
                  moralisPolicy.set("streamId", streamId);
                  moralisPolicy.save();
                  newPolicy.streamId = streamId;

                  this.policies = [...this.policies];
                  this._emitUpdatedPolicies();
                });
            }
          });
      }
    });
  }

  private _emitUpdatedPolicies() {
    this.policiesChangedEvent.emit(this.policies);
  }
}
