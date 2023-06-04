<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let buttonName = '';
    export let active = false;

    function handleClick() {
        dispatch('click');
    }
</script>

<button class="button-toolbar" class:active={active} on:click={handleClick}>
    {buttonName}
</button>

<style>
    .button-toolbar {
        border: 1px solid rgb(224, 224, 224);
        border-radius: 0.5rem;
        background-color: white;
        cursor: pointer;
    }

    .button-toolbar:hover {
        background-color: rgb(240, 240, 240);
    }

    .button-toolbar:active {
        background-color: rgb(224, 224, 224);
    }

    .active {
        background-color: rgb(224, 224, 224);
    }

    .active:hover {
        background-color: rgb(202, 202, 202);
    }
</style>
