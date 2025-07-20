<script lang="ts">
	import type { JumpStartTheme } from '$lib/types/JumpStart';
	import { onMount } from 'svelte';
	import CardSearch from './CardSearch.svelte';
	import type { CardData } from '$lib/types/Card';
	import { Vector2 } from '$lib/util/math.svelte';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';

	let { ready = $bindable(false) } = $props<{
		ready: boolean;
	}>();

	const sets = ['j22', 'j25', 'MOM', 'LTR', 'ONE'];
	const themes_cnt: Record<string, number> = {};

	let chosen_themes: JumpStartTheme[] = $state([]);
	let chosen_set = $state('');

	onMount(() => {
		sets.forEach(async (set) => {
			const res = await fetch(`/deck-lists/${set}.json`);
			const data = await res.json();

			themes_cnt[set] = Object.keys(data).length;
		});
	});

	async function jumpstart(set: string) {
		chosen_set = set;
		const res = await fetch(`/deck-lists/${set}.json`);
		const data = await res.json();

		const theme_1 = Object.keys(data)[Math.floor(Math.random() * Object.keys(data).length)];
		const theme_2 = Object.keys(data)[Math.floor(Math.random() * Object.keys(data).length)];

		chosen_themes = [data[theme_1], data[theme_2]];
	}

	function submit() {
		gameManager.loadJumpStart(chosen_themes);
		
		ready = true
	}

	let preview_cards = $state<CardData[]>([]);
	function previewTheme(t: JumpStartTheme) {
		preview_cards = [];

		t.cards.forEach((c) => {
			for (let i = 0; i < parseInt(c.n); i++) {
				preview_cards.push({
					id: Math.random(),
					img: c.img,
					name: c.name,
					order: 0,
					position: Vector2.zero,
					tapped: false,
					equipped_to: undefined
				});
			}
		});
	}
</script>

<h2>Choose a jumpstart set</h2>

{#if chosen_themes.length > 0}
	<CardSearch bind:card_list={preview_cards} />

	<div class="wrapper my-8 grow">
		<!-- content here -->
		{#each chosen_themes as theme}
			<button class="card big" onclick={() => previewTheme(theme)}>
				<img src={theme.img} alt={theme.name} />
			</button>
		{/each}
	</div>

	<div class="flex">
		<button
			class="mx-auto my-4 w-1/3 cursor-pointer rounded-xl border-4 border-white px-10 py-4 text-xl font-bold text-white transition-all hover:bg-white hover:text-black active:scale-95"
			onclick={() => jumpstart(chosen_set)}>REROLL</button
		>
		<button
			class="mx-auto my-4 w-1/3 cursor-pointer rounded-xl border-4 border-white px-10 py-4 text-xl font-bold text-white transition-all hover:bg-white hover:text-black active:scale-95"
			onclick={submit}>SUBMIT</button
		>
	</div>
{:else}
	<div class="wrapper grow">
		{#each sets as set}
			<button class="card" onclick={() => jumpstart(set)}>
				<span>{themes_cnt[set]}</span>
				<img src="/deck-lists/{set}.png" alt={set} />
			</button>
		{/each}
	</div>
{/if}

<style>
	h2 {
		font-size: 24px;
		color: white;
		font-weight: bold;
		margin-bottom: 5px;
		margin-top: 50px;

		display: flex;
		align-items: center;
		gap: 8px;
	}
	.wrapper {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
		gap: 10px;
	}
	.card {
		position: relative;
		width: 200px;
		min-width: 100px;
		cursor: pointer;
		transition: all 200ms ease;

		filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.564));
		&:hover {
			/* scale: 1.02; */
			transform: translate(-4px, -4px);
			filter: drop-shadow(8px 8px 4px rgba(0, 0, 0, 0.564));
		}
		&:active {
			/* scale: 1.02; */
			transform: translate(0px, 0px);
			filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.564));
		}

		&.big {
			width: 300px;
			min-width: 300px;
		}

		span {
			color: white;
			font-weight: bold;
			font-size: 20px;
			text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.564);
			position: absolute;
			left: 20px;
			bottom: 20px;
		}
	}
</style>
