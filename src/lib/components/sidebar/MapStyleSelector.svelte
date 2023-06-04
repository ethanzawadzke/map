<script>
    import { styleState } from '$lib/utils/store.js';

    let dropdownOpen = false;
</script>

<section class="sidebar-section">
    <button class="sidebar-dropdown-section" on:click={() => dropdownOpen = !dropdownOpen}>
        {#if dropdownOpen}
            <span>-</span>
        {:else}
            <span>+</span>
        {/if}
        Map Styles
    </button>
    {#if dropdownOpen}
        <div class="styles-container">
        {#each $styleState.styles as style (style.name)}
            <button 
                class="style-button"
                class:active={style.name === $styleState.style}
                on:click={() => $styleState.style = style.name}
                style="background-image: url('/img/{style.name}.png');" >
                {style.name}
            </button>
        {/each}
        </div>
    {/if}
</section>



<style>
    .styles-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .style-button {
        width: 100%;
        height: 50px;
        background-size: cover;
        border: none;
        color: white;
        text-shadow: 1px 1px 3px black;
        font-size: 1.2em;
        margin-bottom: 5px;
        margin-left: 4px;
        margin-right: 4px;
        cursor: pointer;
        background-size: cover;
        background-position: center;
        border-radius: .5rem;
    }

    .sidebar-section {
            display: flex;
            flex-direction: column;
            align-items: start;
        }

    .fas {
        cursor: pointer;
        color: grey;
    }

    .fas.fa-eye {
        color: black;
    }

    .checkbox-list {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        height: 100%;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-left: 0.5rem;
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

    .active {
        border: 4px solid rgb(1, 216, 55);
        background-color: red;
    }
</style>