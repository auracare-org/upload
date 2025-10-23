<script lang="ts">
	import type { PageData } from './$types';
	import type { Photo } from '$lib/server/db/schema';

	let { data }: { data: PageData } = $props();

	let uploading = $state(false);
	let photos = $state<Photo[]>([]);
	let error = $state('');
	let success = $state('');

	let selectedFile = $state<File | null>(null);
	let age = $state('');
	let gender = $state('');
	let symptoms = $state('');
	let other = $state('');

	$effect(() => {
		loadPhotos();
	});

	async function loadPhotos() {
		try {
			const response = await fetch('/api/photos');
			const data = await response.json();
			photos = data.photos || [];
		} catch (err) {
			console.error('Failed to load photos:', err);
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		success = '';

		if (!selectedFile) {
			error = 'Please select a file';
			return;
		}

		const symptomsArray = symptoms
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s);

		if (symptomsArray.length === 0) {
			error = 'Please enter at least one symptom';
			return;
		}

		uploading = true;

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('age', age);
		formData.append('gender', gender);
		formData.append('symptoms', JSON.stringify(symptomsArray));
		if (other) formData.append('other', other);

		try {
			const response = await fetch('/api/photos', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Upload failed';
				return;
			}

			success = 'Photo uploaded successfully!';
			selectedFile = null;
			age = '';
			gender = '';
			symptoms = '';
			other = '';

			// Reset file input
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';

			await loadPhotos();
		} catch (err) {
			error = 'Upload failed. Please try again.';
			console.error(err);
		} finally {
			uploading = false;
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
				<h1 class="text-2xl font-bold text-gradient">AuraCare</h1>
				<div class="flex items-center gap-6">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full gradient-healthcare flex items-center justify-center text-white font-semibold">
							{data.user.username.charAt(0).toUpperCase()}
						</div>
						<div class="hidden sm:block">
							<p class="text-sm font-medium text-neutral-900">{data.user.username}</p>
							<p class="text-xs text-neutral-500">Healthcare Provider</p>
						</div>
					</div>
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
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Upload Form -->
			<div>
				<div class="card p-6 card-hover">
					<div class="mb-6">
						<h2 class="text-2xl font-bold text-neutral-900 mb-2">Upload Medical Photo</h2>
						<p class="text-neutral-600 text-sm">Securely upload and store patient medical images</p>
					</div>

					<form onsubmit={handleSubmit} class="space-y-5">
						<div>
							<label for="file" class="block text-sm font-medium text-neutral-700 mb-2">
								Photo File
							</label>
							<input
								id="file"
								type="file"
								accept="image/*"
								required
								onchange={(e) => {
									const target = e.target as HTMLInputElement;
									selectedFile = target.files?.[0] || null;
								}}
								class="block w-full text-sm text-neutral-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-healthcare-50 file:text-healthcare-700 hover:file:bg-healthcare-100 file:cursor-pointer border border-neutral-200 rounded-lg"
							/>
							<p class="text-xs text-neutral-500 mt-1">PNG, JPG, or JPEG (max 10MB)</p>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="age" class="block text-sm font-medium text-neutral-700 mb-2">
									Age
								</label>
								<input
									id="age"
									type="number"
									bind:value={age}
									required
									min="0"
									max="150"
									class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
									placeholder="25"
								/>
							</div>

							<div>
								<label for="gender" class="block text-sm font-medium text-neutral-700 mb-2">
									Gender
								</label>
								<select
									id="gender"
									bind:value={gender}
									required
									class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
								>
									<option value="">Select</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
									<option value="other">Other</option>
								</select>
							</div>
						</div>

						<div>
							<label for="symptoms" class="block text-sm font-medium text-neutral-700 mb-2">
								Symptoms
							</label>
							<input
								id="symptoms"
								type="text"
								bind:value={symptoms}
								required
								placeholder="e.g., headache, fever, cough"
								class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
							/>
							<p class="text-xs text-neutral-500 mt-1">Separate multiple symptoms with commas</p>
						</div>

						<div>
							<label for="other" class="block text-sm font-medium text-neutral-700 mb-2">
								Additional Notes
								<span class="text-neutral-400 font-normal">(optional)</span>
							</label>
							<textarea
								id="other"
								bind:value={other}
								rows="3"
								class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
								placeholder="Any additional observations or notes..."
							></textarea>
						</div>

						{#if error}
							<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						{/if}

						{#if success}
							<div class="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm">
								{success}
							</div>
						{/if}

						<button
							type="submit"
							disabled={uploading}
							class="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{uploading ? 'Uploading...' : 'Upload Photo'}
						</button>
					</form>
				</div>
			</div>

			<!-- Photos Gallery -->
			<div>
				<div class="card p-6">
					<div class="mb-6 flex justify-between items-center">
						<div>
							<h2 class="text-2xl font-bold text-neutral-900 mb-1">Your Uploads</h2>
							<p class="text-neutral-600 text-sm">{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</p>
						</div>
					</div>

					{#if photos.length === 0}
						<div class="text-center py-12">
							<div class="w-16 h-16 bg-healthcare-50 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg class="w-8 h-8 text-healthcare-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<p class="text-neutral-500 text-sm">No photos uploaded yet</p>
							<p class="text-neutral-400 text-xs mt-1">Upload your first medical photo to get started</p>
						</div>
					{:else}
						<div class="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
							{#each photos as photo}
								<div class="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors bg-white">
									<img
										src={photo.imageUrl}
										alt="Medical photo for {photo.gender}, age {photo.age}"
										class="w-full h-48 object-cover rounded-lg mb-3"
									/>
									<div class="space-y-2 text-sm">
										<div class="flex gap-4">
											<div class="flex-1">
												<span class="text-neutral-500">Age:</span>
												<span class="ml-2 font-medium text-neutral-900">{photo.age}</span>
											</div>
											<div class="flex-1">
												<span class="text-neutral-500">Gender:</span>
												<span class="ml-2 font-medium text-neutral-900 capitalize">{photo.gender}</span>
											</div>
										</div>
										<div>
											<span class="text-neutral-500">Symptoms:</span>
											<div class="flex flex-wrap gap-1 mt-1">
												{#each photo.symptoms as symptom}
													<span class="px-2 py-1 bg-healthcare-50 text-healthcare-700 rounded-md text-xs font-medium">
														{symptom}
													</span>
												{/each}
											</div>
										</div>
										{#if photo.other}
											<div>
												<span class="text-neutral-500">Notes:</span>
												<p class="mt-1 text-neutral-700 text-xs bg-neutral-50 p-2 rounded">{photo.other}</p>
											</div>
										{/if}
										<div class="text-xs text-neutral-400 pt-2 border-t border-neutral-100">
											Uploaded: {new Date(photo.uploadedAt).toLocaleString()}
										</div>
									</div>
									<button
										onclick={() => deletePhoto(photo.id)}
										class="mt-3 w-full py-2 px-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
									>
										Delete Photo
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
