// @ts-nocheck

export function bindInfoPanel() {
	const aboutBtn = document.getElementById("aboutBtn");
	const panel = document.getElementById("panel");

	const panelLabel = document.getElementById("panelLabel");
	const panelTitle = document.getElementById("panelTitle");
	const panelText = document.getElementById("panelText");

	function openPanel(event) {
		event?.preventDefault();
		event?.stopPropagation();

		if (!panel) return;

		if (panelLabel) panelLabel.textContent = "ABOUT";
		if (panelTitle) panelTitle.textContent = "Rilievo emotivo";
		if (panelText) {
			panelText.textContent =
				"Cinque cime di significato raccontano le tracce dell’eredità olimpica. Al centro, la città diventa un campo di relazioni, tensioni e trasformazioni.";
		}

		panel.classList.remove("hidden");
	}

	function closePanelHandler(event) {
		const closeButton = event.target.closest("#closePanel");

		if (!closeButton) return;

		event.preventDefault();
		event.stopPropagation();

		console.log("close panel clicked");

		if (!panel) return;

		panel.classList.add("hidden");
	}

	aboutBtn?.addEventListener("click", openPanel);

	// 用 document 事件委托，比直接绑定 closePanel 更稳
	document.addEventListener("click", closePanelHandler, true);

	return () => {
		aboutBtn?.removeEventListener("click", openPanel);
		document.removeEventListener("click", closePanelHandler, true);
	};
}