<script>
	function returnToMap() {
		const backButton = document.getElementById("backToMap");

		if (backButton) {
			backButton.click();
		}
	}
</script>

<div class="ui top-left">
	<div class="kicker">MILANO CORTINA 2026 / LEGACY OLIMPICHE</div>

	<button class="brand-link" type="button" onclick={returnToMap}>
		<h1>Tracce</h1>
	</button>

	<p>
		Una mappa narrativa costruita con particelle, testimonianze e tracce urbane.
		Esplora i luoghi, le voci e i momenti che raccontano ciò che resta
		dell’esperienza olimpica nella città.
	</p>
</div>

<div class="ui top-right">
	<a class="about-btn" href="/about" aria-label="Open about page">
		ABOUT
	</a>
</div>