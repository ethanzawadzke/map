<script>
    import { labelState, mapState, labelLocations, labelTexts } from '$lib/utils/store.js';
    import { onMount } from 'svelte';

    let map = null;
    let dropdownOpen = false;

    onMount(() => {
        // Subscribe to mapState store and set map variable
        const unsubscribe = mapState.subscribe(value => {
            if (value && value.map) {
                map = value.map;
            }
        });
    })


// Then in your toggleVisibility function:
const toggleVisibility = (id) => {
    labelTexts.update(state => {
        state.labels[id].isVisible = !state.labels[id].isVisible;
        const popupElement = document.querySelector(`.popup-${id}`);
        if (popupElement) {
            popupElement.style.visibility = state.labels[id].isVisible ? 'visible' : 'hidden';
        }
        return state;
    });
};

</script>

<div class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        Custom Labels ({Object.keys($labelTexts).length})
    </button>
    {#if dropdownOpen}
        <ul>
            {#each Object.keys($labelTexts) as labelId}
                <li>
                    <span>{labelId}</span>
                    <button on:click={() => toggleVisibility(labelId)}>
                        {#if $labelTexts[labelId].isVisible}
                            Hide
                        {:else}
                            Show
                        {/if}
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