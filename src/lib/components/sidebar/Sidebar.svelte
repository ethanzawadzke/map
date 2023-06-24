
<script>
    import LayerSelect from '$lib/components/sidebar/LayerSelect.svelte';
    import DatasetSelector from '$lib/components/sidebar/DatasetSelector.svelte';
    import MapStyleSelector from '$lib/components/sidebar/MapStyleSelector.svelte';
    import MapLayers from '$lib/components/sidebar/MapLayers.svelte';
    import CustomLabels from '$lib/components/sidebar/CustomLabels.svelte';
    import { loadMap } from '$lib/utils/store.js';

    const loadMapData = () => {
        loadMap.update(value => {
            return {...value, loaded: false}
        })
    }
</script>

<div class="sidebar">
    <button class="btn btn-primary" on:click={loadMapData}>Back</button>
    <LayerSelect />
    <DatasetSelector />
    <MapStyleSelector />
    <MapLayers />
    <CustomLabels />
</div>

<div class="legend-container">
    <div id="legend" class="legend"></div>
    <div id="overlay-legend" class="legend"></div>
</div>


<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        background-color: lightgrey;
        height: 100vh;
        width: 400px;
        overflow-y: auto;
    }

    .legend-container {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 1;
        padding: 10px;
    }

    .legend {
        background-color: #fff;
        border-radius: 3px;
        bottom: 30px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        z-index: 1;
        padding: 10px;
    }

    #overlay-legend {
        right: 200px;
    }
</style>