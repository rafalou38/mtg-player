<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	let { card_id, img_url } = $props();

	// console.log(card_id);

	const slide_scale = 3;
	let tapped = $state(false);

	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		let deltaX = e.clientX - e.currentTarget.offsetLeft;
		let deltaY = e.clientY - e.currentTarget.offsetTop;

		let rx = ((deltaX / e.currentTarget.offsetWidth) * 2 - 1) * slide_scale;
		let ry = ((deltaY / e.currentTarget.offsetHeight) * 2 - 1) * slide_scale;

		e.currentTarget.style.setProperty('--mouse-x', rx.toString());
		e.currentTarget.style.setProperty('--mouse-y', ry.toString());
	}

	function onclick() {
		tapped = !tapped;
	}
</script>

<button class="card" class:tapped {onmousemove} {onclick}>
	<img src={img_url.replace('normal', 'large')} alt="" draggable="false"/>
</button>

<style>
	.card {
		width: 300px;
		overflow: hidden;
		border-radius: 13px;
		margin: 1em;
		box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.4);
		transition: all 200ms ease;
        transform: scale(1) translate(0, 0);

        img{
            user-select: none;
        }

		&.tapped {
			rotate: 90deg;
		}

		&:hover {
			cursor: pointer;
			transform: scale(1.025) translate(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * 1px));
            box-shadow: 4px 4px 5px 0px rgba(0, 0, 0, 0.4);
		}
		/* &:active {
			cursor: pointer;
			transition: all 40ms linear;
			transform: scale(1.05) translate(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * 1px));
		} */
	}
</style>
