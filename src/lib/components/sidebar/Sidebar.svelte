
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
    <LayerSelect />
    <DatasetSelector />
    <MapStyleSelector />
    <MapLayers />
</div>

<div class="legend-container">
    <div class="calculation-box" id="calculation-box">
        <div id="calculated-area">
            <!-- <b>Polygon area:</b> 0.00 <br> 
            <b>Line distance:</b> 0.00 -->
        </div>
    </div>
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
        height: fit-content;
        align-self: end;
    }

    #overlay-legend {
        right: 200px;
        height: fit-content;
        align-self: end;
    }

    .calculation-box {
        display: none;
        bottom: 40px;
        left: 10px;
        background-color: rgba(255, 255, 255, 0.9);
        padding: 15px;
        text-align: center;
    }

    #calculated-area {
        display: none;
        flex-direction: column;
        height: fit-content;
        width: fit-content;
    }
 
    p {
        font-family: 'Open Sans';
        margin: 0;
        font-size: 13px;
        padding: 0;
    }
</style>