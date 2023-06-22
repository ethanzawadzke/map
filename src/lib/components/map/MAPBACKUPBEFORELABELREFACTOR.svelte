<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import { mapState, choroSettings, datasetState, toolState, circleState, styleState, labelState } from "$lib/utils/store.js";
    import { accessToken, datasetId } from "$lib/utils/mapboxConfig.js";
    import { drawLayer, clearLayers, handleLayer, createPopup, convertMilesToMeters } from "$lib/utils/mapFunctions.js";
    import 'quill/dist/quill.snow.css';


    let mapContainer;
    let map;
    let MapboxCircle;
    let Quill;

    let drawnCircles = {};

    function addContextMenuHandler(circleData, circleObject, map, popup) {
        circleObject.on('contextmenu', function(e) {
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
                try {
                    if(circleObject) {
                        console.log('Circle exists. Deleting circle object from map...')
                        console.log('Circle to delete:', circleData.id)
                        console.log('Drawn circles:', drawnCircles)
                        circleObject.remove();
                        delete drawnCircles[circleData.id];
                        console.log('Circle deleted.')
                        console.log('New Drawn circles:', drawnCircles)
                    } else {
                        console.log('Circle does not exist.')
                    }

                    circleState.update(state => {
                        console.log('Deleting circle from state:', circleData.id)
                        console.log('circle ID:', circleData.id)
                        console.log('Current circles:', state.circles)
                        if (state.circles[circleData.id]) {
                            delete state.circles[circleData.id];
                        }
                        console.log('New circles:', state.circles)
                        return state;
                    });

                    popup.remove();
                } catch (error) {
                    console.error("An error occurred:", error);
                }
            };

            const toggleEditButton = document.createElement('button');
            toggleEditButton.textContent = circleObject.options.editable ? 'Disable Editing' : 'Enable Editing';
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
                //remove current circle from drawn circles
                delete drawnCircles[circleData.id];

                //remove current circle from map
                circleObject.remove();

                //remove current circle from state
                circleState.update(state => {
                    console.log('Deleting circle from state:', circleData.id)
                    console.log('circle ID:', circleData.id)
                    console.log('Current circles:', state.circles)
                    if (state.circles[circleData.id]) {
                        delete state.circles[circleData.id];
                    }
                    console.log('New circles:', state.circles)
                    return state;
                });

                //remove popup
                popup.remove();

                //add new circle to state
                circleState.update(state => {
                    console.log('Adding circle to state:', circleData.id)
                    console.log('circle ID:', circleData.id)
                    console.log('Current circles:', state.circles)
                    state.circles[circleData.id] = {
                        id: circleData.id,
                        center: circleData.center,
                        radius: circleData.radius,
                        options: circleData.options,
                        editable: !circleData.editable,
                        color: circleData.color,
                    };
                    console.log('New circles:', state.circles)
                    return state;
                });
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
                let center = circleObject.getCenter();
                let radius = circleObject.getRadius();  // Assuming this is in meters

                // Convert the circle center to a LngLat object
                let lngLatCenter = new mapboxgl.LngLat(center.lng, center.lat);

                // Get all active layers
                let activeLayers = $datasetState.filter(dataset => dataset.enabled);

                // Initialize the total feature count
                let totalFeatureCount = 0;

                // Initialize the total beds count
                let totalBedsCount = 0;

                // Initialize the total slots count
                let totalSlotsCount = 0;


                let testflag = false;

                console.log(activeLayers);
                let featureSet = new Set();

                // For each active layer...
                for (let dataset of activeLayers) {
                    // Query all rendered features in the current layer without specifying bounds
                    let features = map.queryRenderedFeatures({layers: [dataset.layerTitle]});

                    for (let feature of features) {
                        // Convert the feature coordinates to a LngLat object
                        let lngLatFeature = new mapboxgl.LngLat(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);

                        // Calculate the distance from the circle center to the feature in meters
                        let distance = lngLatCenter.distanceTo(lngLatFeature);

                        // If the distance is less than the circle radius, the feature lies within the circle
                        if (distance < radius) {
                            // Add the feature to the set
                            featureSet.add(JSON.stringify(feature));
                        }
                    }
                }

                // Convert the Set back to an array and parse each feature back into an object
                let featuresWithinCircle = Array.from(featureSet).map(featureStr => JSON.parse(featureStr));

                console.log("Features within circle:", featuresWithinCircle);

                popup.remove();

                let totalBeds = 0;
                let totalSlots = 0;

                for (let feature of featuresWithinCircle) {
                // If 'BEDS' and 'SLOTS' aren't null or 0, add to both counts
                if (feature.properties.BEDS != null && feature.properties.BEDS != 0 && feature.properties.SLOTS != null && feature.properties.SLOTS != 0) {
                    console.log("Feature:", feature.properties.BEDS, feature.properties.SLOTS);
                    totalBeds += feature.properties.BEDS/2;
                    totalSlots += feature.properties.SLOTS/2;
                    totalFeatureCount++;

                }
                // Else if 'BEDS' isn't null or 0, add to total beds
                else if (feature.properties.BEDS != null && feature.properties.BEDS != 0) {
                    totalBeds += feature.properties.BEDS;
                    totalFeatureCount++;
                }
                // Else if 'SLOTS' isn't null or 0, add to total slots
                else if (feature.properties.SLOTS != null && feature.properties.SLOTS != 0) {
                    totalSlots += feature.properties.SLOTS;
                    totalFeatureCount++;
                }
            }


                console.log("Total features within circle:", totalFeatureCount);
                console.log("Total beds within circle:", totalBeds);
                console.log("Total slots within circle:", totalSlots);

                //create alert with counts
                alert("Total features within circle: " + totalFeatureCount + "\nTotal beds within circle: " + totalBeds + "\nTotal slots within circle: " + totalSlots);

                totalFeatureCount = 0;
                
            };



            buttonContainer.appendChild(countButton);

            popup.setLngLat(e.lngLat)
                .setDOMContent(buttonContainer)
                .addTo(map);
        });
    }
    
    onMount(async () => {
        const module = await import('mapbox-gl-circle');
        MapboxCircle = module.default;

        const quillModule = await import('quill');
        Quill = quillModule.default;

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

        const test = new mapboxgl.NavigationControl();
        console.log('test:', test);

        map.addControl(test, 'top-right');
        

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

        const mapSources = {
            'counties-dataset': 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg',
            'txzipdata': 'mapbox://ethanzawadzke.clij9wtk24rqw2jpi63kwtsy9-070lw',
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

            map.on('click', function (e) {
                if ($toolState.tool === "Circle") {
                    console.log("tool click")

                    const circleData = {
                        id: Date.now(),
                        center: e.lngLat,
                        radius: convertMilesToMeters($circleState.radius),
                        color: $circleState.color,
                        editable: true,
                    };

                    circleState.update(state => {
                        state.circles[circleData.id] = circleData;
                        console.log(state.circles);
                        return state;
                    });
                } else if ($toolState.tool === "Label") {
                        // Label creation logic
                        const uniqueID = "editor-" + Date.now();
                        const buttonID = "toggle-button-" + uniqueID;

                        const popup = new mapboxgl.Popup({
                            closeOnClick: false, 
                            closeButton: false,
                            anchor: 'bottom',
                            offset: [0, -20],
                            maxWidth: 'none', 
                        })
                        .addClassName(`popup-${uniqueID}`)
                        .setLngLat(e.lngLat)
                        .setHTML(`<div id="${uniqueID}"></div>`)
                        .addTo(map);

                        const popupContentElement = popup.getElement().querySelector('.mapboxgl-popup-content');
                        if (popupContentElement) {
                            popupContentElement.style.backgroundColor = $labelState.isTransparent ? 'transparent' : $labelState.activeColor;
                            //set padding to 0
                            popupContentElement.style.padding = '0px';
                        }

                        console.log($labelState)

                        // specify the fonts you would 
                        var fonts = ['Arial', 'Courier', 'Garamond', 'Tahoma', 'Times New Roman', 'Verdana'];
                        // generate code friendly names
                        function getFontName(font) {
                            return font.toLowerCase().replace(/\s/g, "-");
                        }
                        var fontNames = fonts.map(font => getFontName(font));
                        // add fonts to style
                        var fontStyles = "";
                        fonts.forEach(function(font) {
                            var fontName = getFontName(font);
                            fontStyles += ".ql-snow .ql-picker.ql-font .ql-picker-label[data-value=" + fontName + "]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=" + fontName + "]::before {" +
                                "content: '" + font + "';" +
                                "font-family: '" + font + "', sans-serif;" +
                                "}" +
                                ".ql-font-" + fontName + "{" +
                                " font-family: '" + font + "', sans-serif;" +
                                "}";
                        });
                        var node = document.createElement('style');
                        node.innerHTML = fontStyles;
                        document.body.appendChild(node);

                        // Register custom formats
                        var Size = Quill.import('attributors/style/size');
                        Size.whitelist = ['14px', '16px', '18px', '24px', '36px'];
                        Quill.register(Size, true);

                        // Add fonts to whitelist
                        var Font = Quill.import('formats/font');
                        Font.whitelist = fontNames;
                        Quill.register(Font, true);

                        const toolbarOptions = [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'font': fontNames }], // font selector
                            [{ 'size': ['14px', '16px', '18px', '24px', '36px'] }],  // size options
                            [{ 'color': [] }, { 'background': [] }],  // dropdown with defaults from theme
                            ['check'], // confirm styling
                            ['delete']
                        ];

                        // Initialize Quill editor first
                        const editor = new Quill('#' + uniqueID, {
                            modules: {
                                toolbar: {
                                    container: toolbarOptions,
                                    handlers: {
                                        check: function() {
                                            // Simulate the right click event
                                            let event = new Event('contextmenu', {
                                                bubbles: true,
                                                cancelable: false,
                                            });

                                            document.getElementById(uniqueID).dispatchEvent(event);
                                        },
                                        delete: async function() {
                                        // Show confirmation dialog
                                        if (confirm("Are you sure you want to delete this label?")) {
                                            // User confirmed deletion, proceed with removal
                                            popup.remove();
                                            await labelState.update(state => 
                                                {
                                                    state.editors.delete(`popup-${uniqueID}`);
                                                    delete state.labels[`popup-${uniqueID}`];
                                                    return state;
                                                });
                                            }
                                        },
                                    },
                                },
                            },
                            theme: 'snow',
                        });

                        // Then add it to labelState
                        labelState.update(state => {
                            state.editors.set(uniqueID, editor);
                            state.labels[uniqueID] = {
                                popup: popup,
                                isVisible: true
                            };
                            return state;
                        });


                        const editorElement = document.querySelector('#' + uniqueID + ' .ql-editor');
                        if (editorElement) {
                            $labelState.isTransparent ? editorElement.style.backgroundColor = 'transparent' : $labelState.activeColor;
                        }

                        let isVisible = true;

                        // Function to toggle the editor visibility
                        // Function to toggle the editor visibility
                        const toggleVisibility = function(event) {
                            event.preventDefault();
                            const popupContentElement = event.currentTarget;
                            console.log(popupContentElement)
                            const toolbarElement = popupContentElement.querySelector('.ql-toolbar');
                            const closeButtonElement = popupContentElement.querySelector('.mapboxgl-popup-close-button');
                            const editorElement = popupContentElement.querySelector('.ql-editor');

                            if (toolbarElement) {
                                console.log('toolbarElement exists')
                                isVisible = !isVisible;
                                toolbarElement.style.display = isVisible ? '' : 'none';
                                
                                // Toggle the no-caret class on the editor element
                                if (isVisible) {
                                    if (editorElement) {
                                        editorElement.classList.remove('no-caret');
                                    }
                                } else {
                                    if (editorElement) {
                                        editorElement.classList.add('no-caret');
                                    }
                                }
                            }

                            labelState.update(state => {
                                    /* state.labels[uniqueID].isVisible = !isVisible; */
                                    //check if the label is visible, if it is, set it to false, if it isn't, set it to true
                                    state.labels[uniqueID].isVisible = state.labels[uniqueID].isVisible ? true : false;
                                    return state;
                                });

                            console.log($labelState)
                        };

                        // Function to prevent event bubbling on button click
                        const buttonClickHandler = function(event) {
                            event.stopPropagation();
                            toggleVisibility(event);
                        }

                        // Add event listener to the popup
                        document.getElementById(uniqueID).parentNode.addEventListener('contextmenu', toggleVisibility);

                        // Update label state with the new editor
                        labelState.update(state => {
                            state.editors.set(uniqueID, editor);
                            return state;
                        });

                        popup.on('close', () => {
                            // Remove event listeners when the popup is closed
                            /* document.getElementById(buttonID).removeEventListener('click', buttonClickHandler); */
                            let element = document.getElementById(uniqueID);
                            if(element) {
                                element.parentNode.removeEventListener('click', toggleVisibility);
                            }


                            // Update label state by removing the editor from the editors map
                            // and if it was the active editor, set activeEditor to null
                            labelState.update(state => {
                                state.editors.delete(uniqueID);
                                delete state.labels[uniqueID];

                                if (state.activeEditor === editor) {
                                    state.activeEditor = null;
                                }

                                return state;
                            });
                        });

                        toolState.update(state => {
                            state.tool = null;
                            return state;
                        });
                    }

                    else {
                    var features = map.queryRenderedFeatures(e.point);
                    if (features.length > 0) {
                        const popup = new mapboxgl.Popup();  
                        createPopup(map, popup, e, features);  
                    }
                    console.log($toolState.tool)
                }
            });
        }
    )};

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

        const unsubscribeCircles = circleState.subscribe(value => {
            console.log("CircleState store changed, now executing function...");
            console.log("CircleState: ", value);

            // Identify IDs of circles to remove (those present in drawnCircles but not in the new state)
            const toRemove = Object.keys(drawnCircles).filter(id => !(id in value.circles));

            // Remove these circles from the map and from drawnCircles
            for (let id of toRemove) {
                drawnCircles[id].remove();
                delete drawnCircles[id];
            }

            // Identify IDs of circles to add (those present in the new state but not in drawnCircles)
            const toAdd = Object.keys(value.circles).filter(id => !(id in drawnCircles));

            // Draw these new circles and add them to drawnCircles
            for (let id of toAdd) {
                const circleData = value.circles[id];
                const circle = new MapboxCircle(circleData.center, circleData.radius, {
                    editable: circleData.editable,
                    fillColor: circleData.color
                }).addTo(map, null);

                // Assuming you still want to add a context menu handler
                const popup = new mapboxgl.Popup({ 
                    className: 'no-padding no-arrow', 
                    closeOnClick: true, 
                    closeButton: false,
                    anchor: 'bottom-left', 
                    offset: [0, 0]  
                });
                

                // Add the new circle instance to drawnCircles
                drawnCircles[id] = circle;
                console.log("Listener shit:")
                console.log(circle)
                console.log(drawnCircles[id])
                addContextMenuHandler(circleData, drawnCircles[id], map, popup);
            }
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
    }
</script>


<div bind:this={mapContainer} id="map" style="width: calc(100%); height: 100vh; z-index:0"></div>

<style>
    body { margin: 0; padding: 0; }
    #map {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
    }

    :global(.ql-container.ql-snow) {
        border: 0;
    }

    :global(.mapboxgl-popup-content) {
        padding: 0;
    }

    :global(.ql-snow .ql-picker[data-value=arial] span.ql-picker-label) {
        font-family: 'Arial';
    }

    :global(.ql-snow .ql-picker[data-value=comic-sans] span.ql-picker-label) {
        font-family: 'Comic Sans MS';
    }

    :global(.ql-snow .ql-picker[data-value=times-new-roman] span.ql-picker-label) {
        font-family: 'Times New Roman';
    }

    :global(.ql-snow .ql-picker[data-value=calibri] span.ql-picker-label) {
        font-family: 'Calibri';
    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before) {
        content: '14px';

    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before) {
        content: '16px';

    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before) {
        content: '18px';

    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before) {
        content: '24px';

    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before) {
        content: '36px';

    }

    :global(.ql-toolbar) {
        background-color: white;
    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before) {
    content: '14px';
    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before) {
        content: '16px';

    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before) {
        content: '18px';

    }
    :global(.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before) {
    content: '24px';
    }

    :global(.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="36px"]::before) {
    content: '36px';
    }

    :global(.no-caret::before, .no-caret::after, .no-caret) {
    caret-color: transparent !important;
    }

    :global(.ql-toolbar .ql-check::before) {
    font-size: 14px;
    content: 'Done';
    padding: .4rem;
    color: BLACK;
    width: fit-content;
    }

    :global(.ql-toolbar .ql-delete, .ql-toolbar .ql-check) {
        margin-right: 1rem;
        padding: .25rem;
    }

    :global(.ql-toolbar .ql-delete::before) {
    font-size: 14px;
    content: 'Delete';
    background-color: rgb(158, 1, 1);
    padding: .4rem;
    color: white;
    }

    :global(.mapboxgl-popup.popuptest .mapboxgl-popup-close-button) {
  display: none;
}

    :global(.mapboxgl-ctrl-bottom-right>.mapboxgl-ctrl-attrib.mapboxgl-compact:after) {
        display: none;
    }

    :global(.mapboxgl-ctrl-group:not(:empty)) {
        margin: 0;
    }

    :global(.mapboxgl-ctrl-top-right.mapboxgl-ctrl) {
        margin: 0;
    }

    :global(.mapbox-ctrl-attrib-button) {
        display: none;
    }

    :global(.mapboxgl-ctrl-bottom-right) {
        display: none;
    }

    :global(.mapboxgl-ctrl-logo.mapboxgl-compact) {
        display: none;
    }

</style>
