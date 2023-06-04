<script>
    import { onDestroy } from 'svelte';
    import { mapState } from '$lib/utils/store.js';
    import { get } from 'svelte/store';

    let layerNames = [];
    let layerVisibilities = {};
    let dropdownOpen = false;

    let unsubscribe = mapState.subscribe(value => {
        if (value && value.map) {
            value.map.on('load', () => {
                layerNames = value.map.getStyle().layers.map(layer => layer.id);
                layerNames.forEach(name => {
                    value.map.setLayoutProperty(name, 'visibility', 'visible');
                    layerVisibilities[name] = true;
                });
            });
        }
    });

    onDestroy(() => {
        unsubscribe();
    });

    function setLayerVisibility(map, layerId, isVisible) {
        map.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
        layerVisibilities[layerId] = isVisible;
    }
</script>

<div class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        Style Layers
    </button>
    {#if dropdownOpen}
        <ul>
            {#each layerNames as name (name)}
                <li>
                    <input type="checkbox" bind:checked={layerVisibilities[name]} on:change={(event) => setLayerVisibility(get(mapState).map, name, event.target.checked)} /> 
                    {name}
                </li>
            {/each}
        </ul>
    {/if}
</div>


<style>
    ul {
        list-style: none;
        padding: 0;
        margin-left: 1rem;
        font-family: Arial, Helvetica, sans-serif;
    }

    .sidebar-section {
        display: flex;
        flex-direction: column;
        align-items: start;
        /* height: calc(100% - 52px); */
        background-color: rgb(236, 236, 236);
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