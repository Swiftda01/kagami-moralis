import { Component, OnInit, Input } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Cluster } from "../../models/cluster";
import { Policy } from "../../models/policy";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "policy-form",
  templateUrl: "./policy-form.component.html",
  styleUrls: ["./policy-form.component.scss"],
})
export class PolicyFormComponent implements OnInit {
  @Input() clusters: Cluster[];

  @Input() id: string;
  @Input() clusterId: string;
  @Input() type: string;
  @Input() rules: any = {};
  @Input() recipients: string[];
  @Input() streamId: string;

  policy: Policy;

  types: string[] = ["Daily Limit", "Transaction Limit"];

  currentAddedAddress: string | null = null;

  displayedColumns: string[] = ["email address", "remove"];

  constructor(
    public dialogRef: MatDialogRef<PolicyFormComponent>,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this._initializePolicyForm();
  }

  addAddress() {
    if (!this.currentAddedAddress || !this._validCurrentAddedAddress()) {
      this.toastr.error("Invalid email address");
      return;
    }

    this.policy.recipients = [
      ...this.policy.recipients,
      this.currentAddedAddress,
    ];
    this.currentAddedAddress = null;
  }

  removeAddress(address) {
    this.policy.recipients = this.policy.recipients.filter(
      (existingAddress) => {
        return existingAddress !== address;
      }
    );
  }

  save() {
    const savedPolicy = this.policy.type ? this.policy : null;
    this.dialogRef.close({ saved: savedPolicy });
  }

  delete() {
    this.dialogRef.close({ deleted: true });
  }

  FormValid() {
    return (
      !this.policy.clusterId || !this.policy.type || !this._typeFormValid()
    );
  }

  resetTypeSpecificFom(selection) {
    this.policy.rules.max = null;
  }

  private _typeFormValid() {
    if (this.policy.type) {
      return this.policy.rules.max !== null && this.policy.rules.max >= 0;
    }
  }

  private _validCurrentAddedAddress() {
    const validEmailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return validEmailRegex.test(this.currentAddedAddress.toLocaleLowerCase());
  }

  private _initializePolicyForm() {
    this.policy = new Policy();
    this.policy.id = this.id;
    this.policy.clusterId = this.clusterId;
    this.policy.type = this.type;
    this.policy.recipients = this.recipients || [];
    this.policy.streamId = this.streamId;

    for (const rule in this.rules) {
      if (this.rules.hasOwnProperty(rule)) {
        this.policy.rules[rule] = this.rules[rule];
      }
    }
  }
}
