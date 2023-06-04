<script>
  import { onMount, onDestroy } from 'svelte';
  import { mapState } from '$lib/utils/store.js';
  import mapboxgl from 'mapbox-gl';

  let map = null;
  let mouseCoordinates = { lng: 0, lat: 0 };

  let unsubscribe = mapState.subscribe(value => {
    map = value.map;
    if (map) {
      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'bottom-right');

      map.on('mousemove', (e) => {
        mouseCoordinates = e.lngLat;
      });
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<style>
  :global(.mapboxgl-ctrl-group) {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 10px;
    right: 10px;
  }

  :global(.mapboxgl-ctrl-zoom-in::before),
  :global(.mapboxgl-ctrl-zoom-out::before),
  :global(.mapboxgl-ctrl-compass::before) {
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Font Awesome 5 Free";
    font-size: 20px;
    padding: 0;
    margin: 0;
  }

  :global(.mapboxgl-ctrl-zoom-in::before) {
    content: "\2b"; /* Up arrow icon */
    font-weight: bold;
  }

  :global(.mapboxgl-ctrl-zoom-out::before) {
    content: "\f068"; /* Down arrow icon */
    font-weight: bold;
    font-size: 10px;
  }

  :global(.mapboxgl-ctrl-compass::before) {
    content: "\f14e"; /* Compass icon */
  }
</style>