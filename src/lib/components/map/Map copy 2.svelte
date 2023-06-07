<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import { mapState, choroSettings, datasetState, toolState, circleState, styleState } from "$lib/utils/store.js";
    import { accessToken, datasetId } from "$lib/utils/mapboxConfig.js";
    import { drawLayer, clearLayers, handleLayer, createPopup, convertMilesToMeters } from "$lib/utils/mapFunctions.js";

    let mapContainer;
    let map;
    let MapboxCircle;

    onMount(async () => {
        const module = await import('mapbox-gl-circle');
        MapboxCircle = module.default;

        initializeMap();
        setupEventHandlers();
        setupStoreSubscriptions();
    });

    function initializeMap() {
        mapboxgl.accessToken = accessToken;
        map = new mapboxgl.Map({
            container: mapContainer,
            projection: "mercator",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-96, 37.8],
            zoom: 3,
        });

        mapState.set({ map: map });
        styleState.set({ style: 'streets-v12' });

        const mapSources = {
            'counties-dataset': 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg',
            'suckmyfuckingcockmapbox': 'mapbox://ethanzawadzke.clij9wtk24rqw2jpi63kwtsy9-070lw',
            'txlunchdatafinal': 'mapbox://ethanzawadzke.clihvcvkk12832dp41bdytixx-9xmp5'
        };

        map.on('load', function() {
            for (let id in mapSources) {
                map.addSource(id, {
                    type: 'vector',
                    url: mapSources[id]
                });
            }
        });
    }

    function setupEventHandlers() {
        map.on('load', function() {
            map.addSource('counties-dataset', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg'
            });

            map.addSource('suckmyfuckingcockmapbox', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clij9wtk24rqw2jpi63kwtsy9-070lw'
            });

            map.addSource('txlunchdatafinal', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clihvcvkk12832dp41bdytixx-9xmp5'
            });

            function isPointInCircle(point, circleCenter, radius) {
                const dx = circleCenter.lng - point.lng;
                const dy = circleCenter.lat - point.lat;
                return dx * dx + dy * dy <= radius * radius;
            }


            function addContextMenuHandler(circleObject, map, popup) {
                circleObject.circle.on('contextmenu', function(e) {
                    e.preventDefault();
                    console.log('Opening context menu...')
                    circleState.update(state => {
                        state.contextMenuOpen = true;
                        return state;
                    });
                    console.log('Context menu open:', $circleState.contextMenuOpen);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.style.cssText = `
                        display: block;
                        background-color: white;
                        color: black;
                        padding: 5px 10px;
                        border: none;
                        text-align: left;
                        cursor: pointer;
                        width: 100%;
                        box-sizing: border-box;
                    `;
                    deleteButton.onmouseover = function() {
                        this.style.backgroundColor = '#0078D7';
                        this.style.color = 'white';
                    };
                    deleteButton.onmouseout = function() {
                        this.style.backgroundColor = 'white';
                        this.style.color = 'black';
                    };
                    deleteButton.onclick = function() {
                        /* your delete button code */
                        try {
                            if(circleObject.circle) {
                                circleObject.circle.remove();
                            }

                            circleState.update(state => {
                                if (state.circles[circleObject.id]) {
                                    delete state.circles[circleObject.id];
                                }
                                return state;
                            });

                            console.log('Removing popup...')
                            popup.remove();

                        } catch (error) {
                            console.error("An error occurred:", error);
                        }
                    };

                    const toggleEditButton = document.createElement('button');
                    toggleEditButton.textContent = circleObject.circle.options.editable ? 'Disable Editing' : 'Enable Editing';
                    toggleEditButton.style.cssText = `
                        display: block;
                        background-color: white;
                        color: black;
                        padding: 5px 10px;
                        border: none;
                        text-align: left;
                        cursor: pointer;
                        width: 100%;
                        box-sizing: border-box;
                    `;
                    toggleEditButton.onmouseover = function() {
                        this.style.backgroundColor = '#0078D7';
                        this.style.color = 'white';
                    };
                    toggleEditButton.onmouseout = function() {
                        this.style.backgroundColor = 'white';
                        this.style.color = 'black';
                    };
                    toggleEditButton.onclick = function() {
                        // Create a new circle with the opposite editable state
                        let newCircle = new MapboxCircle(circleObject.circle.getCenter(), circleObject.circle.getRadius(), {
                            ...circleObject.circle.options,
                            editable: !circleObject.circle.options.editable
                        }).addTo(map);

                        // Replace the old circle with the new one
                        circleObject.circle.remove();
                        circleObject.circle = newCircle;

                        // Update the button text to reflect the current editable state
                        toggleEditButton.textContent = circleObject.circle.options.editable ? 'Disable Editing' : 'Enable Editing';
                        popup.remove();

                        // Recreate the context menu for the new circle
                        addContextMenuHandler(circleObject, map, popup);
                    };

                    const buttonContainer = document.createElement('div');
                    buttonContainer.appendChild(deleteButton);
                    buttonContainer.appendChild(toggleEditButton);

                    const countButton = document.createElement('button');
                    countButton.textContent = 'Count Features';
                    countButton.style.cssText = `
                        display: block;
                        background-color: white;
                        color: black;
                        padding: 5px 10px;
                        border: none;
                        text-align: left;
                        cursor: pointer;
                        width: 100%;
                        box-sizing: border-box;
                    `;
                    countButton.onmouseover = function() {
                        this.style.backgroundColor = '#0078D7';
                        this.style.color = 'white';
                    };
                    countButton.onmouseout = function() {
                        this.style.backgroundColor = 'white';
                        this.style.color = 'black';
                    };
                    countButton.onclick = function() {
                        // Get the circle's center and radius
                        let center = circleObject.circle.getCenter();
                        let radius = circleObject.circle.getRadius();  // Assuming this is in meters

                        // Convert the circle center to a LngLat object
                        let lngLatCenter = new mapboxgl.LngLat(center.lng, center.lat);

                        // Get all active layers
                        let activeLayers = $datasetState.filter(dataset => dataset.enabled);

                        // Initialize the total feature count
                        let totalFeatureCount = 0;

                        // For each active layer...
                        for (let dataset of activeLayers) {
                            // Query all rendered features in the current layer without specifying bounds
                            let features = map.queryRenderedFeatures({layers: [dataset.layerTitle]});

                            // For each feature in the current layer...
                            for (let feature of features) {
                                // Convert the feature coordinates to a LngLat object
                                let lngLatFeature = new mapboxgl.LngLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);

                                // Calculate the distance from the circle center to the feature in meters
                                let distance = lngLatCenter.distanceTo(lngLatFeature);

                                // If the distance is less than the circle radius, the feature lies within the circle
                                if (distance < radius) {
                                    // Increase the total feature count
                                    totalFeatureCount++;
                                }
                            }
                        }
                        popup.remove();
                        window.alert("Total feature count: " + totalFeatureCount/2);
                    };

                    buttonContainer.appendChild(countButton);

                    popup.setLngLat(e.lngLat)
                        .setDOMContent(buttonContainer)
                        .addTo(map);
                });
            }


            map.on('click', function (e) {
                if ($toolState.tool){
                    console.log("tool click")

                    const circle = new MapboxCircle(e.lngLat, convertMilesToMeters($circleState.radius), {
                        editable: true,
                        fillColor: $circleState.color
                    }).addTo(map, null);

                    const circleObject = {
                        id: Date.now(),
                        circle: circle
                    };

                    const popup = new mapboxgl.Popup({ 
                        className: 'no-padding no-arrow', 
                        closeOnClick: true, 
                        closeButton: false,
                        anchor: 'bottom-left', 
                        offset: [0, 0]  
                    });

                    addContextMenuHandler(circleObject, map, popup);

                    circleState.update(state => {
                        state.circles[circleObject.id] = circleObject;
                        return state;
                    });
                } else {
                    var features = map.queryRenderedFeatures(e.point);
                    if (features.length > 0) {
                        const popup = new mapboxgl.Popup();  
                        createPopup(map, popup, e, features);  
                    }
                }
            });
        });
    }

    function setupStoreSubscriptions() {
        const unsubscribeChoro = choroSettings.subscribe(value => {
        console.log("ChoroSettings store changed, now executing function...");
        clearLayers(map);
        drawLayer($choroSettings.selectedLayer, map);
        console.log("ChoroSettings: ", $choroSettings);
    });

    const unsubscribeDataset = datasetState.subscribe(value => {
        console.log("DatasetState store changed, now executing function...");
        console.log("DatasetState: ", $datasetState);
        handleLayer(map, $datasetState);
    });

    const unsubscribeStyle = styleState.subscribe(value => {
        console.log("StyleState store changed, now executing function...");
        map.setStyle(`mapbox://styles/mapbox/${$styleState.style}`);
        
        map.once('styledata', function () {
            map.addSource('counties-dataset', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg'
            });

            map.addSource('suckmyfuckingcockmapbox', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clij9wtk24rqw2jpi63kwtsy9-070lw'
            });

            map.addSource('txlunchdatafinal', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clihvcvkk12832dp41bdytixx-9xmp5'
            });

            handleLayer(map, $datasetState);
            drawLayer($choroSettings.selectedLayer, map);
        });
    });


    return () => {
        unsubscribeChoro();
        unsubscribeDataset();
        unsubscribeStyle();
        if (map) {
            map.remove();
        }
    };
    }

    // ...
    // continue breaking down the large code blocks into smaller functions
</script>


<div bind:this={mapContainer} id="map" style="width: calc(100%); height: 100vh;"></div>

<style>
    #map {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>