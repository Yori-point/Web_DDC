export const legacyAreas = [
	{
		id: "01",
		key: "festa",
		title: "Festa / Celebrazione",
		text: "Il cuore che celebra. La cima più luminosa.",
		hoverText: `Le Olimpiadi portano con sé un'energia difficile da descrivere:
			la gioia condivisa, il tifo, quella sensazione
			di far parte di qualcosa di grande.`,
		x: -15,
		z: 2,
		height: 5.2,
		radius: 9.8,
		spread: 1.0,
		color: 0xF9F5CC
	},
	{
		id: "02",
		key: "opportunita",
		title: "Lavoro / Opportunità",
		text: "Direzioni che aprono il futuro.",
		hoverText: `Per molti, le Olimpiadi non sono state solo uno
			spettacolo da guardare, ma un'occasione concreta:
			di lavoro, di crescita, di visibilità.`,
		x: -1,
		z: -18,
		height: 8.4,
		radius: 10.2,
		spread: 1.15,
		color: 0x93ABDB
	},
	{
		id: "03",
		key: "trasformazione",
		title: "Cambiamento / Trasformazione",
		text: "Territori in divenire, forme che si ridisegnano.",
		hoverText: `Le Olimpiadi trasformano una città, ma non tutto
			quello che cambia è destinato a restare.`,
		x: 29,
		z: -8,
		height: 8.6,
		radius: 10.6,
		spread: 1.2,
		color: 0x547BCA
	},
	{
		id: "04",
		key: "criticita",
		title: "Problemi / Criticità",
		text: "Le valli da ascoltare. Ombre che chiedono cura.",
		hoverText: `Non tutto ha funzionato. Dietro i riflettori dei Giochi
			ci sono anche disagi reali, contraddizioni e voci
			critiche che meritano di essere ascoltate.`,
		x: -6,
		z: 21,
		height: -4.6,
		radius: 10.8,
		spread: 1.25,
		color: 0xF2B6B4
	},
	{
		id: "05",
		key: "relazioni",
		title: "Relazioni / Incontri",
		text: "Il nucleo che connette. Incontri che generano nuove possibilità.",
		hoverText: `Una conversazione con uno sconosciuto, uno sguardo
			condiviso sullo stesso schermo. A volte bastano pochi
			secondi per trasformare una folla in una comunità.`,
		x: 30,
		z: 22,
		height: 5.8,
		radius: 8.5,
		spread: 1.0,
		color: 0x85BDA9
	}
];

export const hookHeightByKey = {
	festa: 16.0,
	opportunita: 14.0,
	trasformazione: 8.5,
	criticita: 27.0,
	relazioni: 13.0
};