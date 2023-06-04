<script>
    import { onMount } from 'svelte';
    import { datasetState, toolState } from '$lib/utils/store.js';
    let dropdownOpen = false;

    let datasetProperties = {};

    onMount(async () => {
        $datasetState.forEach(async (dataset, index) => {
            if (dataset.enableFilterMenu) {
                const response = await fetch(dataset.data);
                const data = await response.json();
                const properties = data.features && data.features[0] ? Object.keys(data.features[0].properties).slice(8) : [];
                datasetProperties[index] = properties;
            }
        });
    });

    // Helper function to handle checkbox changes
    const handleCheckboxChange = (index, property) => {
        toolState.update(state => state = {active: `property-${index}-${property}`});
    };
</script>

<section class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        Datasets 
    </button>

    {#if dropdownOpen}
        <div class="checkbox-list">
            {#each $datasetState as dataset, index}
            <div class="checkbox-item">
                {#if dataset.enabled}
                    <i class="fas fa-eye" on:click={() => dataset.enabled = !dataset.enabled}></i>
                {:else}
                    <i class="fas fa-eye-slash" on:click={() => dataset.enabled = !dataset.enabled}></i>
                {/if}
                <div class="color-square" style="background-color: {dataset.color};"></div>
                <label>{dataset.layerTitle}</label>
            </div>
        {/each}
        </div>
    {/if}
</section>



<style>
    .sidebar-section {
        display: flex;
        flex-direction: column;
        align-items: start;
        /* height: calc(100% - 52px); */
    }

    .fas {
        cursor: pointer;
        color: grey;
        margin-left: 1rem;
    }

    .fas.fa-eye {
        color: rgb(82, 82, 82);
    }

    .fas.fa-eye-slash {
        color: grey;
    }

    .checkbox-list {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        margin-bottom: 1px;
        background-color: rgb(240, 240, 240);
        width: 100%;
        font-family: Arial, Helvetica, sans-serif;
    }

    .color-square {
        display: inline-block;
        min-width: 10px;
        height: 10px;
        margin: .5rem;
    }

    .sidebar-dropdown-section {
        width: 100%;
        text-align: left;
        border: 0;
        background-color: transparent;
        font-size: 1rem;
        font-family: Helvetica, sans-serif;
        font-weight: 400;
        padding-left: 1rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        background-color: rgb(240, 240, 240);
        margin-bottom: 1px;
    }

    .sidebar-dropdown-section:hover {
        background-color: rgb(255, 255, 255);
    }
</style>
