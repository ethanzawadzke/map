<script>
    import { labelState, mapState } from '$lib/utils/store.js';
    import { onMount } from 'svelte';

    import mapboxgl from 'mapbox-gl';

    let map = null;
    let dropdownOpen = false;

    onMount(() => {
        map = mapState.map;
    })

    let unsubscribe = mapState.subscribe(value => {
            map = value.map;
        });
    function toggleLabelVisibility(uniqueID) {
        labelState.update(state => {
            const label = state.labels[uniqueID];
            label.isVisible = !label.isVisible;

            // Toggle popup visibility on the map
            label.popup[label.isVisible ? 'addTo' : 'remove'](map);

            return state;
        });
    }
</script>

<div class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        Custom Labels ({Object.keys($labelState.labels).length})
    </button>
    {#if dropdownOpen}
    <ul>
    {#each Object.keys($labelState.labels) as uniqueID}
        <li>
            Label: {uniqueID}
            <button on:click={() => toggleLabelVisibility(uniqueID)}>
                {$labelState.labels[uniqueID].isVisible ? 'Hide' : 'Show'}
            </button>
        </li>
    {/each}
    
</ul>
{/if}

</div>


<style>
    .sidebar-section {
        display: flex;
        flex-direction: column;
        align-items: start;
        /* height: calc(100% - 52px); */
    }

    ul {
        list-style: none;
        padding: 0;
        margin-left: 1px;
        margin-right: 1px;
        font-family: Arial, Helvetica, sans-serif;
        margin-top: 0px;
        margin-bottom: 1px;
        width: 100%;
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
        margin-top: 1px;
    }

    .sidebar-dropdown-section:hover {
        background-color: rgb(255, 255, 255);
    }

    li {
        background-color: rgb(238, 238, 238);
        padding: 1rem;
        margin-bottom: 1px;
    }
</style>