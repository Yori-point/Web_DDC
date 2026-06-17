// @ts-nocheck

export function openMediaPanel(item) {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");

	const mediaPanelLabel = document.getElementById("mediaPanelLabel");
	const mediaPanelTitle = document.getElementById("mediaPanelTitle");
	const mediaPanelText = document.getElementById("mediaPanelText");

	if (!mediaPanel) return;

	if (mediaMap) mediaMap.classList.add("has-open");

	if (mediaPanelLabel) mediaPanelLabel.textContent = item.label;
	if (mediaPanelTitle) mediaPanelTitle.textContent = item.title;
	if (mediaPanelText) mediaPanelText.textContent = item.text;

	mediaPanel.classList.remove("hidden");
}

export function closeMediaPanel() {
	const mediaPanel = document.getElementById("mediaPanel");
	const mediaMap = document.querySelector(".chapter-media-map");

	if (mediaPanel) mediaPanel.classList.add("hidden");
	if (mediaMap) mediaMap.classList.remove("has-open");

	document.querySelectorAll(".interview-node").forEach((node) => {
		node.classList.remove("is-active");
	});
}

export function bindMediaPanelClose() {
	const closeMediaPanelButton = document.getElementById("closeMediaPanel");
	const mediaPanel = document.getElementById("mediaPanel");

	function handleClose(event) {
		event?.preventDefault();
		event?.stopPropagation();

		closeMediaPanel();
	}

	function handleOutsideClick(event) {
		const panel = document.getElementById("mediaPanel");

		if (!panel || panel.classList.contains("hidden")) return;

		const clickedInsidePanel = event.target.closest("#mediaPanel");
		const clickedNode = event.target.closest(".interview-node");

		if (clickedInsidePanel || clickedNode) return;

		closeMediaPanel();
	}

	closeMediaPanelButton?.addEventListener("click", handleClose);
	mediaPanel?.addEventListener("click", (event) => event.stopPropagation());

	window.addEventListener("pointerdown", handleOutsideClick);

	return () => {
		closeMediaPanelButton?.removeEventListener("click", handleClose);
		window.removeEventListener("pointerdown", handleOutsideClick);
	};
}