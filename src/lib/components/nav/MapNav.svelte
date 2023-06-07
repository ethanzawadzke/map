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

