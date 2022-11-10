import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ToastrService } from "ngx-toastr";

const serverUrl = environment.server_url;
const appId = environment.app_id;

const MoralisV1 = require("moralis-v1");
MoralisV1.start({ serverUrl, appId });

@Injectable({
  providedIn: "root",
})
export class MoralisV1Service {
  user: any;

  constructor(private toastr: ToastrService) {}

  async authenticateCurrentUser() {
    await this.getCurrentUser();

    if (!this.user) {
      await MoralisV1.enableWeb3({ throwOnError: true, provider: "metamask" });
      const { account, chainId } = MoralisV1;

      if (!account) {
        throw new Error("Connecting to chain failed, as no connected account was found");
      }
      if (!chainId) {
        throw new Error("Connecting to chain failed, as no connected chain was found");
      }

      const { message } = await MoralisV1.Cloud.run("requestMessage", {
        address: account,
        chain: parseInt(chainId, 16),
        network: "evm",
      });

      await MoralisV1.authenticate({
        signingMessage: message,
        throwOnError: true,
      }).then(
        (user) => {
          this.user = user;
        },
        (error) => {
          console.log(error);
          let errorMessage;
          if (typeof error === "object") {
            errorMessage = error.message;
          }
          this.toastr.error(errorMessage || error);
        }
      );
    }

    this.user.setACL(new MoralisV1.ACL(this.user));
    return this.user;
  }

  async logOutUser() {
    MoralisV1.User.logOut();
  }

  async getCurrentUser() {
    this.user = await MoralisV1.User.current();
    return this.user;
  }

  async createStream(policyId: string, addresses: string[]) {
    const newStreamId = await MoralisV1.Cloud.run("createStream", {
      description: `Native Transactions for Policy #${policyId}`,
      tag: "limit",
      webhookUrl: "https://kagami-webhooks.herokuapp.com/check_transaction_limit",
    });

    MoralisV1.Cloud.run("updateStreamAddresses", {
      id: newStreamId,
      from: [],
      to: addresses
    });

    return newStreamId;
  }

  async deleteStream(id: string) {
    if (!id) {
      return;
    }
    await MoralisV1.Cloud.run("deleteStream", { id });
  }

  async updateStreamAddresses(id: string, from: string[], to: string[]) {
    if (!id) {
      return;
    }
    await MoralisV1.Cloud.run("updateStreamAddresses", { id, from, to });
  }

  async create(objectType: string, attributes: object, relations: object = {}) {
    const MoralisObject = this._moralisObject(objectType);
    const moralisObject = new MoralisObject();

    moralisObject.setACL(new MoralisV1.ACL(this.user));

    for (const [key, value] of Object.entries(attributes)) {
      moralisObject.set(key, value);
    }

    const relatedObjects = Object.entries(relations).map(
      async ([relatedObjectType, id]) => {
        return await this._get(relatedObjectType, id);
      }
    );

    (await Promise.all(relatedObjects)).forEach((relatedObject) => {
      moralisObject.set(relatedObject.className.toLowerCase(), relatedObject);
    });

    return moralisObject.save().then(
      (savedObject) => {
        console.log(`New ${objectType} created with id: ${savedObject.id}`);
        return savedObject;
      },
      (error) => {
        console.log(
          `Failed to create new ${objectType}, with error code: ${error.message}`
        );
      }
    );
  }

  async update(objectType: string, objectId: string, attributes: object) {
    return this._get(objectType, objectId).then((moralisObject) => {
      for (const [key, value] of Object.entries(attributes)) {
        moralisObject.set(key, value);
      }

      return moralisObject.save().then(
        (savedObject) => {
          console.log(`Updated ${objectType} with id: ${objectId}`);
          return savedObject;
        },
        (error) => {
          console.log(
            `Failed to update ${objectType} with error code: ${error.message}`
          );
        }
      );
    });
  }

  async delete(objectType: string, objectId: string) {
    return this._get(objectType, objectId).then((moralisObject) => {
      return moralisObject.destroy().then(
        (deletedObject) => {
          console.log(`Deleted ${objectType} with id: ${objectId}`);
          return deletedObject;
        },
        (error) => {
          console.log(
            `Failed to delete ${objectType} with error code: ${error.message}`
          );
        }
      );
    });
  }

  async getOrCreateToken() {
    const tokens = await this.getAll("Token");

    if (tokens.length === 0) {
      const owner = this.user.attributes.ethAddress;
      MoralisV1.Cloud.run("assignToken", { owner });
      this.create("Token", { owner });
    }
  }

  async getAll(objectType: string) {
    return this._query(objectType).find();
  }

  private async _get(objectType: string, id: string) {
    return this._query(objectType).get(id);
  }

  private _query(objectName: string) {
    return new MoralisV1.Query(this._moralisObject(objectName));
  }

  private _moralisObject(objectName: string) {
    return MoralisV1.Object.extend(objectName);
  }
}
