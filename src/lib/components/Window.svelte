<script lang="ts">
	let { children, active = $bindable(false), on_close } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="backdrop"
	class:active
	onclick={() => {
		active = false;
        on_close();
	}}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="window" onclick={(e) => e.stopPropagation()}>
		{@render children()}
	</div>
</div>

<style>
	.backdrop {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
		z-index: 1000;

		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);

		justify-content: center;
		align-items: center;

		display: none;
		&.active {
			display: flex;
		}

		.window {
			display: flex;
			flex-direction: column;
			padding: 1em;
			background: black;
			background-image: url('/texture/45-degree-fabric-light.png');
			background-size: 128px 128px;
			border-radius: 8px;
			box-shadow: 4px 4px 8px 0px rgba(0, 0, 0, 0.24);
		}
	}
</style>
