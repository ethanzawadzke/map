<script>
    import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
    import Map from '$lib/components/map/Map.svelte';
    import MapNav from '../lib/components/nav/MapNav.svelte';
    import Toolbar from '../lib/components/toolbar/Toolbar.svelte';
</script>

<div class='main'>
    <Sidebar />
    <Map />
    <MapNav />
    <Toolbar />
</div>

<style>
    .main {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
    }
</style>