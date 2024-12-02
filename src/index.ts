import { pongoClient } from '@event-driven-io/pongo';
export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "HYPERDRIVE" with the variable name you defined.
	HYPERDRIVE: Hyperdrive;
}

type User = {
	_id: string;
	name: string
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		console.log(JSON.stringify(env))

		try {
			// Create a database client that connects to our database via Hyperdrive
			// Hyperdrive generates a unique connection string you can pass to
			// supported drivers, including node-postgres, Postgres.js, and the many
			// ORMs and query builders that use these drivers.
			const pongo = pongoClient(env.HYPERDRIVE.connectionString, {pooled:false});

			const users = pongo.db().collection<User>("cloudflare");

			const now = new Date().toISOString();

			const {insertedId } = await users.insertOne({_id: now, name: `test-${now}`});

			// Test query
			const {_version, ...user } = await users.findOne({_id: insertedId!});

			console.log(JSON.stringify(user));

			// Returns result rows as JSON
			return Response.json({ result: user });
		} catch (e) {
			console.log(e);
			return Response.json({ error: e.message }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;