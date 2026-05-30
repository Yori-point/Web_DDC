<script>
	import favicon from "$lib/assets/favicon.svg";

	import "$lib/styles/reset.css";
	import "$lib/styles/token.css";
	import "$lib/styles/base.css";
	import "$lib/styles/layout.css";
	import "$lib/styles/components.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}