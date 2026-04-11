
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const hasLegacyViteSupabaseVars = true;

const supabaseConfigErrorMessage =
	'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';

const createMockQueryBuilder = () => {
	const response = { data: null, error: new Error(supabaseConfigErrorMessage) };

	const builder = {
		select: () => builder,
		eq: () => builder,
		neq: () => builder,
		gt: () => builder,
		gte: () => builder,
		lt: () => builder,
		lte: () => builder,
		like: () => builder,
		ilike: () => builder,
		contains: () => builder,
		order: () => builder,
		limit: () => builder,
		range: () => builder,
		insert: () => builder,
		update: () => builder,
		delete: () => builder,
		upsert: () => builder,
		single: async () => response,
		maybeSingle: async () => response,
		then: (onFulfilled, onRejected) => Promise.resolve(response).then(onFulfilled, onRejected),
	};

	return builder;
};

const mockSupabase = {
	from: () => createMockQueryBuilder(),
	rpc: async () => ({ data: null, error: new Error(supabaseConfigErrorMessage) }),
	auth: {
		signUp: async () => ({ data: null, error: new Error(supabaseConfigErrorMessage) }),
		signInWithPassword: async () => ({ data: null, error: new Error(supabaseConfigErrorMessage) }),
		signOut: async () => ({ error: new Error(supabaseConfigErrorMessage) }),
		getSession: async () => ({ data: { session: null }, error: new Error(supabaseConfigErrorMessage) }),
	},
};

if (!isSupabaseConfigured) {
	console.warn(`[supabaseClient] ${supabaseConfigErrorMessage}`);
	if (hasLegacyViteSupabaseVars) {
		console.warn(
			'[supabaseClient] Detected VITE_SUPABASE_* variables. For Next.js deploys, use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.'
		);
	}
}

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseKey)
	: mockSupabase;

export { isSupabaseConfigured, supabaseConfigErrorMessage };

