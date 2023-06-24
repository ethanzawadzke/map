<script>
    import { onMount } from 'svelte';
    import { accessToken, datasetId } from '$lib/utils/mapboxConfig.js';
    import { choroSettings } from '$lib/utils/store.js'

    const url1 = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=100&access_token=${accessToken}`;

    const url2 = `https://api.mapbox.com/datasets/v1/ethanzawadzke/clj6y2qrc20dc2hnxzx8r30c5/features?limit=100&access_token=sk.eyJ1IjoiZXRoYW56YXdhZHprZSIsImEiOiJjbGo2dzRmNTQwbjN2M2tudmh6amx3eDh2In0.cZuc0Z37c3wBz4q3V-XeDw`;

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
            const properties2 = data2.features[99].properties;
            const propertyNames2 = Object.keys(properties2);
            let numericProperties2 = propertyNames2.filter((name) => {
                return typeof properties2[name] === 'number';
            });
            numericProperties2 = propertyNames2.sort();  

            const layerTitles = numericProperties1.concat(numericProperties2);

            choroSettings.update(state => {
                return {
                    ...state,
                    layerTitles: [].concat(layerTitles),
                    overlayTitles: [].concat(numericProperties2),
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
        {#if $choroSettings.layerTitles.length}
            <label class="choropleth-label" for="layer-select">Choropleth layer:</label>
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
                    <div class="color-selector">
                        <label for="start-color-input">Start color:</label>
                        <input id="start-color-input" type="color" bind:value={$choroSettings.startColor}/> 
                    </div>
                    
                    <div class="color-selector">
                        <label for="end-color-input">End color:</label>
                        <input id="end-color-input" type="color" bind:value={$choroSettings.endColor}/> 
                    </div>
                    
                </div>
            </div>
        {/if}

        {#if $choroSettings.overlayTitles.length}
            <label class="choropleth-label" for="layer-select">Overlay layer:</label>
            <select class="layer-select" bind:value={$choroSettings.selectedOverlay}>
                <option value="None">None</option>
                {#each $choroSettings.overlayTitles as overlayTitle}   
                    <option value={overlayTitle}>{overlayTitle}</option>
                {/each}
            </select>
            
            <div class="overlay-selector">
                <label for="overlay-input">Overlay point color:</label>
                <input id="overlay-input" type="color" bind:value={$choroSettings.overlayColor}/> 
            </div>
        {/if}
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

    .choropleth-label {
        margin-left: 1rem;
        margin-bottom: 0;
    }

    .layer-select {
        margin: 1rem;
        margin-top: 0;
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
        flex-direction: row;
        justify-content: space-between;
        margin-top: 1rem;
    }

    .sidebar-dropdown-section:hover {
        background-color: rgb(255, 255, 255);
    }

    .overlay-selector {
        margin-left: 1rem;
        margin-bottom: 1rem;
    }

</style>