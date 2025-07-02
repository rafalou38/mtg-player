<script lang="ts">
	let {
		options,
		open = $bindable(false),
		position,
		onclose
	}: {
		options: { name: string; action: () => void }[];
		open: boolean;
		position: { x: number; y: number };
		onclose?: () => void;
	} = $props();
</script>

<svelte:body
	onmousedown={(e) => {
		if (e.buttons == 1) {
			open = false;
			onclose?.();
		}
	}}
	onmouseleave={() => {
		open = false;
		onclose?.();
	}}
/>
<div class="context-menu" class:open style="left: {position.x}px; top: {position.y}px">
	<div class="context-bg"></div>
	{#each options as option}
		<button
			class="context-menu-item"
			onmousedown={(e) => {
				e.stopPropagation();
                
				option.action();
                
				open = false;
				onclose?.();
			}}>{option.name}</button
		>
	{/each}
</div>

<style>
	.context-menu {
		background-color: #151515;

		position: fixed;
		display: flex;
		flex-direction: column;

		opacity: 0;
		pointer-events: none;
		transition: opacity 100ms ease;

		z-index: 100000;
		&.open {
			opacity: 1;
			pointer-events: all;
		}
		.context-bg {
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			position: absolute;
			background-image: url('/texture/45-degree-fabric-light.png');
			opacity: 0.4;
			background-size: 200px;
			pointer-events: none;
		}
		button {
			text-align: left;
			padding: 5px 50px 5px 30px;

			color: #fff;

			cursor: pointer;

			font-weight: 500;
			font-size: 16px;

			transition: all 100ms ease;

			&:hover {
				background: #202020;
			}
		}
	}
</style>
