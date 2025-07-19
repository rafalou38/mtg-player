let d4 = {};

(async () => {
	let data = d4;
	const l = document.querySelectorAll('deck-list').length;
	let i = 0;
	for (const e of document.querySelectorAll('deck-list')) {
		(e.previousElementSibling || e).scrollIntoView();
		const name = e.getAttribute('deck-title');

		let select = e.querySelector('select');
		while (!select) {
			await new Promise((r) => {
				setTimeout(r, 500);
			});
			select = e.querySelector('select');
		}
		select.value = 'color';

		const event = new Event('change', { bubbles: true });
		select.dispatchEvent(event);

		await new Promise((r) => {
			setTimeout(r, 500);
		});

		let cards = e.querySelectorAll('auto-card');
		let src = e.previousElementSibling?.querySelector('img')?.getAttribute('src');
		while (cards.length == 0) {
			await new Promise((r) => {
				setTimeout(r, 500);
			});
			cards = e.querySelectorAll('auto-card');
			//   src = e.previousElementSibling?.querySelector('magic-card')?.getAttribute('face');
			src = e.previousElementSibling?.querySelector('img')?.getAttribute('src');
			console.log(cards);
		}

		data[name] = {
			img: src,
			name,
			cards: []
		};
		cards.forEach((c) => {
			const c_img = c.getAttribute('face');
			const c_name = c.getAttribute('name');
			const c_cnt = c.querySelector('.css-qYZFO').innerText;
			data[name].cards.push({
				name: c_name,
				n: c_cnt,
				img: c_img
			});
		});

		console.log(i, l, data[name]);
		i++;
	}

	console.log(data);
})();

// https://mtg.fandom.com/wiki/Category:Jumpstart_sets

/*

Object.keys(d).forEach(k=>
	console.log(d[k].cards.reduce((acc,v)=>acc+parseInt(v.n), 0))                      
)

 */
