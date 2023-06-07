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

        mapState.set({ map: map });

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
                if ($toolState.tool === "Circle"){
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

                    circleState.update(state => {
                        state.circles[circleObject.id] = circleObject;
                        return state;
                    });

                    addContextMenuHandler(circleObject, map, popup);
                } else if ($toolState.tool === "Label") {
    // Label creation logic
    const uniqueID = "editor-" + Date.now();
    const buttonID = "toggle-button-" + uniqueID;

    const popup = new mapboxgl.Popup({
        closeOnClick: false, 
        closeButton: true,
        anchor: 'bottom',
        offset: [0, -20],
        maxWidth: 'none', 
    })
    .addClassName('popuptest')
    .setLngLat(e.lngLat)
    .setHTML(`<div id="${uniqueID}"></div>`)
    .addTo(map);

    const popupContentElement = popup.getElement().querySelector('.mapboxgl-popup-content');
    if (popupContentElement) {
        popupContentElement.style.backgroundColor = $labelState.isTransparent ? 'transparent' : $labelState.activeColor;
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
    ];

    const editor = new Quill('#' + uniqueID, {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    const editorElement = document.querySelector('#' + uniqueID + ' .ql-editor');
    if (editorElement) {
        $labelState.isTransparent ? editorElement.style.backgroundColor = 'transparent' : $labelState.activeColor;
    }

     let isVisible = true;

    // Function to toggle the editor visibility
    const toggleVisibility = function(event) {
        event.preventDefault();
        const popupContentElement = event.currentTarget;
        const toolbarElement = popupContentElement.querySelector('.ql-toolbar');

        if (toolbarElement) {
            isVisible = !isVisible;
            toolbarElement.style.display = isVisible ? '' : 'none';
        }

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

    // ... Your remaining code ...

    popup.on('close', () => {
        // Remove event listeners when the popup is closed
        document.getElementById(buttonID).removeEventListener('click', buttonClickHandler);
        document.getElementById(uniqueID).parentNode.removeEventListener('click', toggleVisibility);

        // Update label state by removing the editor from the editors map
        // and if it was the active editor, set activeEditor to null
        labelState.update(state => {
            state.editors.delete(uniqueID);
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


<div bind:this={mapContainer} id="map" style="width: calc(100%); height: 100vh;"></div>

<style>
    #map {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
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

    /* set mapbox popup tip displays to none */
    :global(.mapboxgl-popup-tip) {
        display: none;
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



</style>
