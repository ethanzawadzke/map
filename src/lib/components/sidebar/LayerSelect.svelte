<script>
    import { onMount } from 'svelte';
    import { accessToken, datasetId } from '$lib/utils/mapboxConfig.js';
    import { choroSettings } from '$lib/utils/store.js'

    const url1 = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;

    const url2 = `https://api.mapbox.com/datasets/v1/ethanzawadzke/clij9wtk24rqw2jpi63kwtsy9/features?limit=50&access_token=${accessToken}`;

    let dropdownOpen = false;

    onMount(async () => {
        try {
            // Fetch data from first URL
            const response1 = await fetch(url1);
            const data1 = await response1.json();
            const properties1 = data1.features[0].properties;
            const propertyNames1 = Object.keys(properties1);
            const numericProperties1 = propertyNames1.filter((name) => {
                return typeof properties1[name] === 'number';
            });

            // Fetch data from second URL
            const response2 = await fetch(url2);
            const data2 = await response2.json();
            const properties2 = data2.features[4].properties;
            const propertyNames2 = Object.keys(properties2);
            const numericProperties2 = propertyNames2;

            // Limit the numeric properties from the second URL to the last four
            const lastFourNumericProperties2 = numericProperties2;

            // Combine the numeric properties from the first URL with the last four from the second URL
            const combinedNumericProperties = [...numericProperties1, ...lastFourNumericProperties2];

            choroSettings.update(state => {
                return {
                    ...state,
                    layerTitles: [].concat(combinedNumericProperties),
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
        Demographic Data
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