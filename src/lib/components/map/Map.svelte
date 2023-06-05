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

        mapboxgl.accessToken = accessToken;
        map = new mapboxgl.Map({
            container: mapContainer,
            projection: "mercator",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-96, 37.8],
            zoom: 3,
        });

        mapState.update(state => {
            return {
                ...state,
                map: map
            }
        });

        styleState.update(state => {
            return {
                ...state,
                style: 'streets-v12'
            }
        });

        map.on('load', function() {
            map.addSource('counties-dataset', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg'
            });

            map.addSource('txlunchdatafinal', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clihvcvkk12832dp41bdytixx-9xmp5'
            });

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
    });
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