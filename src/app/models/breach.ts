import { Policy } from './policy';

export class Breach {
	public id: string | null;
	public policyId: string | null;
	public policy: Policy | null;
	public occurredAt: string | null;
	public rules: any | null = {};
	public violation: any | null = {};
	public notified: string[] | null;
}
