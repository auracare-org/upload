<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let uploading = $state(false);
	let error = $state('');
	let success = $state('');
	let isDragging = $state(false);

	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let age = $state('');
	let gender = $state('');
	let ear = $state('');
	let symptoms = $state('');
	let other = $state('');

	function handleFileSelect(file: File) {
		selectedFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			previewUrl = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				handleFileSelect(file);
			} else {
				error = 'Please select an image file';
			}
		}
	}

	function triggerFileInput() {
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		if (fileInput) fileInput.click();
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
		formData.append('ear', ear);
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
			previewUrl = null;
			age = '';
			gender = '';
			ear = '';
			symptoms = '';
			other = '';

			// Reset file input
			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
		} catch (err) {
			error = 'Upload failed. Please try again.';
			console.error(err);
		} finally {
			uploading = false;
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
									const file = target.files?.[0];
									if (file) handleFileSelect(file);
								}}
								class="block w-full text-sm text-neutral-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-healthcare-50 file:text-healthcare-700 hover:file:bg-healthcare-100 file:cursor-pointer border border-neutral-200 rounded-lg"
							/>
							<p class="text-xs text-neutral-500 mt-1">PNG, JPG, or JPEG (max 1GB)</p>
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
							<label for="ear" class="block text-sm font-medium text-neutral-700 mb-2">
								Ear
							</label>
							<select
								id="ear"
								bind:value={ear}
								required
								class="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
							>
								<option value="">Select</option>
								<option value="left">Left Ear</option>
								<option value="right">Right Ear</option>
							</select>
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

			<!-- Photo Preview / Drop Zone -->
			<div>
				<div class="card p-6">
					<div class="mb-6">
						<h2 class="text-2xl font-bold text-neutral-900 mb-1">Photo Preview</h2>
						<p class="text-neutral-600 text-sm">Preview your selected image</p>
					</div>

					{#if previewUrl}
						<!-- Photo Preview -->
						<div class="space-y-4">
							<div class="relative group">
								<img
									src={previewUrl}
									alt="Preview of selected medical photo"
									class="w-full h-96 object-cover rounded-lg border-2 border-neutral-200"
								/>
								<button
									type="button"
									aria-label="Remove selected photo"
									onclick={() => {
										selectedFile = null;
										previewUrl = null;
										const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
										if (fileInput) fileInput.value = '';
									}}
									class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							<div class="text-center">
								<p class="text-sm text-neutral-600">File: {selectedFile?.name}</p>
								<p class="text-xs text-neutral-500">Size: {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
							</div>
						</div>
					{:else}
						<!-- Drop Zone -->
						<div
							role="button"
							tabindex="0"
							onclick={triggerFileInput}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									triggerFileInput();
								}
							}}
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
							class="border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer {isDragging
								? 'border-primary-500 bg-primary-50'
								: 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50'}"
						>
							<div class="space-y-4">
								<div class="w-16 h-16 bg-healthcare-50 rounded-full flex items-center justify-center mx-auto">
									<svg class="w-8 h-8 text-healthcare-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
								</div>
								<div>
									<p class="text-lg font-medium text-neutral-900">Drop your photo here</p>
									<p class="text-sm text-neutral-500 mt-1">or click to browse</p>
								</div>
								<div class="text-xs text-neutral-400">
									<p>PNG, JPG, or JPEG</p>
									<p>Maximum file size: 1GB</p>
								</div>
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										triggerFileInput();
									}}
									class="btn btn-healthcare inline-flex items-center gap-2"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									Browse Files
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>
