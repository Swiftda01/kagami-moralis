import { Cluster } from './cluster';

export class Policy {
	public id: string | null;
	public cluster: Cluster | null;
	public clusterId: string | null;
	public type: string | null;
	public rules: any | null = {};
	public recipients: string[] | null;
}
