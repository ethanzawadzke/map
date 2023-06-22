<script>
    import { get, writable } from 'svelte/store';
    import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
    import Map from '$lib/components/map/Map.svelte';
    import MapNav from '../lib/components/nav/MapNav.svelte';
    import Toolbar from '../lib/components/toolbar/Toolbar.svelte';
    import {loadMap} from '../lib/utils/store.js';

    const loadExistingMapData = (activeLayer) => {
        if (typeof window !== 'undefined') {
            const mapDataItem = localStorage.getItem('mapData');
            const mapData = mapDataItem ? JSON.parse(mapDataItem) : {};
            const existingMapData = mapData[activeLayer];
            if (existingMapData) {
                loadMap.update(value => {
                    return {...value, loaded: true, activeLayer: activeLayer}
                })
            } else {
                console.error(`Map data for "${activeLayer}" not found in local storage.`);
            }
        }
    }
    
    const loadMapData = (activeLayer) => {
        let existingMapData = {};
        if (typeof window !== 'undefined') {
            const existingMapDataItem = localStorage.getItem('mapData');
            existingMapData = existingMapDataItem ? JSON.parse(existingMapDataItem) : {};
            existingMapData[activeLayer] = {};
            localStorage.setItem('mapData', JSON.stringify(existingMapData));
        }

        loadMap.update(value => {
            console.log("test value", value)
            return {...value, loaded: true, activeLayer: activeLayer}
        })
    }

    const printLocalStorage = () => {
        let mapData = {};
        if (typeof window !== 'undefined') {
            const mapDataItem = localStorage.getItem('mapData');
            mapData = mapDataItem ? JSON.parse(mapDataItem) : {};
        }
        console.log(mapData);
    }

    let mapData = {};
    if (typeof window !== 'undefined') {
        const mapDataItem = localStorage.getItem('mapData');
        mapData = mapDataItem ? JSON.parse(mapDataItem) : {};
    }
</script>


    <div class='main'>
        <Sidebar />
        <Map />
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

    .main2 {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        justify-content: center;
        align-items: center;
    }

    ul {
        list-style-type: none;
        display: flex;
        flex-direction: column;
        width: auto;
    }
</style>