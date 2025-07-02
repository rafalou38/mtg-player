<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import Icon from '@iconify/svelte';
	import Window from './Window.svelte';
	import { Vector2 } from '$lib/util/math.svelte';

	let { active = $bindable(false) } = $props();

	function create_counter(e: any, type = '', start_value = 0) {
		active = false;
		gameManager.blocked = false;
		gameManager.addTrinket({
			id: Math.random(),
			type: 'counter',
			image: type,
			value: start_value,
			position: new Vector2(
				(e.clientX - gameManager.translate.x - 40) / gameManager.zoom,
				(e.clientY - gameManager.translate.y - 40) / gameManager.zoom
			)
		});
	}

	function create_marker(e: any, icon = '') {
		gameManager.addTrinket({
			id: Math.random(),
			type: 'marker',
			image: icon,
			value: 0,
			position: new Vector2(
				(e.clientX - gameManager.translate.x - 40) / gameManager.zoom,
				(e.clientY - gameManager.translate.y - 40) / gameManager.zoom
			)
		});
		active = false;
		gameManager.blocked = false;
	}
</script>

<Window bind:active on_close={() => (gameManager.blocked = false)}>
	<div class="wrapper">
		<button onclick={(e) => create_counter(e, 'gp')}><i class="ms ms-counter-plus">-</i></button>
		<div class="row">
			<button onclick={(e) => create_counter(e, 'hp', 20)}>20</button>
			<button onclick={(e) => create_counter(e, 'hp', 30)}>30</button>
			<button onclick={(e) => create_counter(e, 'hp', 40)}>40</button>
		</div>
		<div class="row">
			<button onclick={(e) => create_counter(e, '/', 1)}>+1/+1</button>
			<button onclick={(e) => create_counter(e, '/', -1)}>-1/-1</button>
			<button onclick={(e) => create_counter(e, 'loyalty')}
				><i class="ms ms-counter-loyalty">-</i></button
			>
		</div>
		<div class="row">
			<button onclick={(e) => create_counter(e, 'energy')}><i class="ms ms-e">-</i></button>
			<button onclick={(e) => create_counter(e, 'mana')}><i class="ms ms-c">-</i></button>
			<button onclick={(e) => create_counter(e, 'poison')}><i class="ms ms-p">-</i></button>
			<button onclick={(e) => create_counter(e, 'rad')}><i class="ms ms-counter-rad">-</i></button>
		</div>
		<hr />
		<div class="row">
			<button onclick={(e) => create_marker(e, 'ability-indestructible')} title="indestructible"
				><i class="ms ms-ability-indestructible">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-hexproof')} title="hexproof"
				><i class="ms ms-ability-hexproof">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-ward')} title="ward"
				><i class="ms ms-ability-ward">-</i></button
			>
		</div>
		<div class="row">
			<button onclick={(e) => create_marker(e, 'ability-deathtouch')} title="deathtouch"
				><i class="ms ms-ability-deathtouch">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-vigilance')} title="vigilance"
				><i class="ms ms-ability-vigilance">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-reach')} title="reach"
				><i class="ms ms-ability-reach">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-haste')} title="haste"
				><i class="ms ms-ability-haste">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-first-strike')} title="first strike"
				><i class="ms ms-ability-first-strike">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-double-strike')} title="double strike"
				><i class="ms ms-ability-double-strike">-</i></button
			>
		</div>
		<div class="row">
			<button onclick={(e) => create_marker(e, 'ability-lifelink')} title="lifelink"
				><i class="ms ms-ability-lifelink">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-trample')} title="trample"
				><i class="ms ms-ability-trample">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-flying')} title="flying"
				><i class="ms ms-ability-flying">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-menace')} title="menace"
				><i class="ms ms-ability-menace">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-prowess')} title="prowess"
				><i class="ms ms-ability-prowess">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-defender')} title="defender"
				><i class="ms ms-ability-defender">-</i></button
			>
		</div>
		<div class="row">
			<button onclick={(e) => create_marker(e, 'counter-stun')} title="stun"
				><i class="ms ms-counter-stun">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-goad')} title="goad"
				><i class="ms ms-ability-goad">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-suspect')} title="suspect"
				><i class="ms ms-ability-suspect">-</i></button
			>
			<button onclick={(e) => create_marker(e, 'ability-decayed')} title="decayed"
				><i class="ms ms-ability-decayed">-</i></button
			>
			<button
				onclick={(e) => create_marker(e, 'ability-the-ring-tempts-you')}
				title="the ring tempts you"><i class="ms ms-ability-the-ring-tempts-you">-</i></button
			>
		</div>
	</div>
</Window>

<style>
	:global(.iconify) {
		margin: 0 auto;
	}
	i {
		font-size: 30px;
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.row {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}

	button {
		padding: 15px 30px;
		flex-grow: 1;
		border-radius: 6px;
		background-color: #151515;
		color: #fff;
		border: none;
		cursor: pointer;

		font-weight: 500;
		font-size: 16px;

		transition: all 100ms ease;

		&:hover {
			scale: 1.02;
		}

		&:active {
			scale: 0.98;
		}
	}
</style>
