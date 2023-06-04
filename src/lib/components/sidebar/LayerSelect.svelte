<script>
    import { onMount } from 'svelte';
    import { accessToken, datasetId } from '$lib/utils/mapboxConfig.js';
    import { choroSettings } from '$lib/utils/store.js'

    const url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;

    let dropdownOpen = false;

    onMount(async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const properties = data.features[0].properties;
            const propertyNames = Object.keys(properties);
            const numericProperties = propertyNames.filter((name) => {
                return typeof properties[name] === 'number';
            });

            choroSettings.update(state => {
                return {
                    ...state,
                    layerTitles: ["None", "ENROLLED PCT"],
                }
            });

            choroSettings.update(state => {
                return {
                    ...state,
                    layerTitles: [].concat(numericProperties),
                }
            });
        } catch (error) {
            console.error('Error: ' + error);
        }
    });
</script>

<section class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        County Data
    </button>
    {#if dropdownOpen}
    <select class="layer-select" bind:value={$choroSettings.selectedLayer}>
        <option value="None">None</option>
        <option value="ENROLLED PCT">ENROLLED PCT</option>
        {#each $choroSettings.layerTitles as layerTitle}
            <option value={layerTitle}>{layerTitle}</option>
        {/each}
    </select>

    <div class="choro-settings">
       <label for="color-steps-input">Color Steps:</label>
        <input id="color-steps-input" type="number" bind:value={$choroSettings.colorSteps}/>

        <div class="color-steps-container">
            <label for="start-color-input">Color 1:</label>
            <input id="start-color-input" type="color" bind:value={$choroSettings.startColor}/>

            <label for="end-color-input">Color 2:</label>
            <input id="end-color-input" type="color" bind:value={$choroSettings.endColor}/> 
        </div>
    </div>
    
    {/if}   
</section>

<style>
    .sidebar-section {
        display: flex;
        flex-direction: column;
        align-items: start;
        background-color: rgb(245, 245, 245);
        margin-bottom: 1px;
    }

    .layer-select {
        margin: 1rem;
    }

    .sidebar-dropdown-section {
        width: 100%;
        height: 100%;
        text-align: left;
        border: 0;
        font-size: 1rem;
        font-family: Helvetica, sans-serif;
        font-weight: 400;
        padding-left: 1rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        background-color: rgb(240, 240, 240);
        margin-bottom: 1px;
    }

    .choro-settings {
        margin-left: 1rem;
        margin-bottom: 1rem;
    }

    .color-steps-container {
        display: flex;
        flex-direction: column;
    }

    .sidebar-dropdown-section:hover {
        background-color: rgb(255, 255, 255);
    }

</style>