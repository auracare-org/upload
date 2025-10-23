<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen flex items-center justify-center gradient-bg px-4">
	<div class="max-w-md w-full">
		<div class="card p-8">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold mb-2 text-gradient">AuraCare</h1>
				<p class="text-neutral-600">Sign in to your account</p>
			</div>

			<form method="post" use:enhance class="space-y-6">
				<div>
					<label for="username" class="block text-sm font-medium text-neutral-700 mb-2">
						Username
					</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						class="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
						placeholder="Enter your username"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-neutral-700 mb-2">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
						placeholder="Enter your password"
					/>
				</div>

				{#if form?.message}
					<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
						{form.message}
					</div>
				{/if}

				<button type="submit" class="w-full btn btn-primary btn-lg">
					Sign in
				</button>

				<div class="text-center pt-4">
					<p class="text-neutral-600 text-sm">
						Don't have an account?
						<a href="/register" class="font-semibold healthcare-accent hover:underline">
							Register here
						</a>
					</p>
				</div>
			</form>
		</div>

		<div class="text-center mt-6 text-neutral-500 text-sm">
			<p>Secure healthcare data management</p>
		</div>
	</div>
</div>
