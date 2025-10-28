<script lang="ts">
	import type { PageData } from './$types';
	import type { Photo } from '$lib/server/db/schema';

	let { data }: { data: PageData } = $props();

	let photos = $state<Photo[]>([]);
	let loading = $state(true);

	$effect(() => {
		loadPhotos();
	});

	async function loadPhotos() {
		loading = true;
		try {
			const response = await fetch('/api/photos');
			const result = await response.json();
			photos = result.photos || [];
		} catch (err) {
			console.error('Failed to load photos:', err);
		} finally {
			loading = false;
		}
	}

	async function deletePhoto(id: number) {
		if (!confirm('Are you sure you want to delete this photo?')) return;

		try {
			const response = await fetch(`/api/photos/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const result = await response.json();
				alert(result.error || 'Delete failed');
				return;
			}

			await loadPhotos();
		} catch (err) {
			alert('Delete failed. Please try again.');
			console.error(err);
		}
	}
</script>

<div class="min-h-screen bg-secondary-50">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50 backdrop-blur-header">
		<div class="container">
			<div class="flex justify-between items-center h-16">
				<a href="/" class="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity">
					AuraCare
				</a>
				<div class="flex items-center gap-6">
					<a href="/account" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
						<div class="w-10 h-10 rounded-full gradient-healthcare flex items-center justify-center text-white font-semibold">
							{data.user.username.charAt(0).toUpperCase()}
						</div>
						<div class="hidden sm:block">
							<p class="text-sm font-medium text-neutral-900">{data.user.username}</p>
							<p class="text-xs text-neutral-500">Healthcare Provider</p>
						</div>
					</a>
					<form method="post" action="/logout">
						<button type="submit" class="btn btn-secondary text-sm">
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="container py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-neutral-900 mb-2">Your Account</h1>
					<p class="text-neutral-600">Manage your uploaded medical photos</p>
				</div>
				<a href="/" class="btn btn-primary">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Upload New Photo
				</a>
			</div>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="card p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-neutral-900">{photos.length}</p>
						<p class="text-sm text-neutral-600">Total Uploads</p>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-healthcare-100 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-healthcare-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<div>
						<p class="text-2xl font-bold text-neutral-900">{data.user.username}</p>
						<p class="text-sm text-neutral-600">Username</p>
					</div>
				</div>
			</div>

			<div class="card p-6">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
						<svg class="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div>
						<p class="text-lg font-bold text-neutral-900">{data.user.location || 'Not set'}</p>
						<p class="text-sm text-neutral-600">Location</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Photos Grid -->
		<div class="card p-6">
			<div class="mb-6 flex justify-between items-center">
				<div>
					<h2 class="text-2xl font-bold text-neutral-900 mb-1">Your Uploads</h2>
					<p class="text-neutral-600 text-sm">{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</p>
				</div>
			</div>

			{#if loading}
				<div class="text-center py-12">
					<div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
					<p class="text-neutral-500 mt-4">Loading your uploads...</p>
				</div>
			{:else if photos.length === 0}
				<div class="text-center py-12">
					<div class="w-16 h-16 bg-healthcare-50 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-healthcare-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<p class="text-neutral-500 text-sm mb-4">No photos uploaded yet</p>
					<a href="/" class="btn btn-primary">Upload Your First Photo</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each photos as photo}
						<div class="border border-neutral-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors bg-white card-hover">
							<img
								src={photo.imageUrl}
								alt="Medical photo for {photo.gender}, age {photo.age}"
								class="w-full h-64 object-cover"
							/>
							<div class="p-4 space-y-3">
								<div class="flex gap-4 text-sm">
									<div class="flex-1">
										<span class="text-neutral-500">Age:</span>
										<span class="ml-2 font-medium text-neutral-900">{photo.age}</span>
									</div>
									<div class="flex-1">
										<span class="text-neutral-500">Gender:</span>
										<span class="ml-2 font-medium text-neutral-900 capitalize">{photo.gender}</span>
									</div>
								</div>
								<div class="text-sm">
									<span class="text-neutral-500">Ear:</span>
									<span class="ml-2 font-medium text-neutral-900 capitalize">{photo.ear}</span>
								</div>
								<div>
									<span class="text-sm text-neutral-500">Symptoms:</span>
									<div class="flex flex-wrap gap-1 mt-2">
										{#each photo.symptoms as symptom}
											<span class="px-2 py-1 bg-healthcare-50 text-healthcare-700 rounded-md text-xs font-medium">
												{symptom}
											</span>
										{/each}
									</div>
								</div>
								{#if photo.other}
									<div>
										<span class="text-sm text-neutral-500">Notes:</span>
										<p class="mt-1 text-neutral-700 text-xs bg-neutral-50 p-2 rounded line-clamp-2">{photo.other}</p>
									</div>
								{/if}
								<div class="text-xs text-neutral-400 pt-3 border-t border-neutral-100">
									Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
								</div>
								<button
									onclick={() => deletePhoto(photo.id)}
									class="w-full py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
								>
									Delete Photo
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>
