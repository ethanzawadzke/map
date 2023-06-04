import { mapState, choroSettings } from "./store";
import { accessToken, datasetId } from "./mapboxConfig";
import chroma from "chroma-js";
import mapboxgl from "mapbox-gl";

export function generateColors(numColors) {
    let startColor, endColor;

    const unsubscribe = choroSettings.subscribe(state => {
        startColor = state.startColor;
        endColor = state.endColor;
    });

    const colors = chroma.scale([startColor, endColor]).colors(numColors);

    unsubscribe(); // Remember to unsubscribe when done

    return colors;
}

export function clearLayers(map) {
    if (map.getLayer("choro-data-layer")) {
        map.removeLayer("choro-data-layer");
    }
}

export function drawLayer(layerTitle, map) { // <-- pass map as a parameter
    return new Promise((resolve, reject) => {
        //if map is texas districts, set datasetid to that id
        let test = null; 

        if (layerTitle !== "None") {
            if (layerTitle === "ENROLLED PCT") {
                test = 'clihvcvkk12832dp41bdytixx'
            }

            let selectedLayer, colorSteps;

            const unsubscribe = choroSettings.subscribe(state => {
                selectedLayer = state.selectedLayer;
                colorSteps = state.colorSteps;
            });

            let url;
            let source;

            if (test !== null) {
                source = 'txlunchdatafinal'
            } else {
                source = 'counties-dataset'
            }

            if (test !== null) {
                url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${test}/features?limit=50&access_token=${accessToken}`;
                console.log("using test url")
            } else {
                url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;
            }
            

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let minPop = Infinity;
                    let maxPop = -Infinity;
                    for (let feature of data.features) {
                        let pop = feature.properties[selectedLayer];
                        pop = typeof pop === 'string' ? parseFloat(pop) : pop;


                        minPop = Math.min(minPop, pop);
                        maxPop = Math.max(maxPop, pop);
                        console.log(minPop, maxPop)
                        //log types of both
                        console.log(typeof minPop, typeof maxPop)
                    }
                    return [minPop, maxPop];
                })
                .then(range => {
                    let [minPop, maxPop] = range;
                    let colorStops = [];
                    let colors = generateColors(colorSteps);
                    for (let i = 0; i < colors.length; i++) {
                        let pop = minPop + (maxPop - minPop) * (i / (colors.length - 1));
                        colorStops.push(pop, colors[i]);
                    }
                    return colorStops;
                })
                .then(colorStops => {
                    //console log source
                    console.log("source: " + source)
                    map.addLayer({
                        'id': 'choro-data-layer',
                        'type': 'fill',
                        'source': `${source}`,
                        'source-layer': `${source}`,
                        'paint': {
                            'fill-color': ['step', ['get', selectedLayer], '#fff', ...colorStops],
                            'fill-opacity': 0.8
                        }
                    }, 'land-structure-line');

                    let legend = document.getElementById('legend');
                    legend.innerHTML = `<h4>${layerTitle}</h4>`;
                    for (let i = 0; i < colorStops.length; i += 2) {
                        let pop = colorStops[i];
                        let color = colorStops[i + 1];
                        legend.innerHTML +=
                            `<i style="background:${color};width:10px;height:10px;display:inline-block;"></i> ${pop.toFixed(2)}<br>`;
                    }

                    resolve();
                    unsubscribe(); // Move unsubscribe here
                });

            console.log(`Drawing layer: ${layerTitle}`);
        }
    });
}

function addLayer(map, layer) {
    if (map.getSource(layer.layerTitle)) {
        console.warn(`Source ${layer.layerTitle} already exists`);
        return;
    }

    switch (layer.type) {
        case "tileset":
            addTileset(map, layer);
            break;
        case "geojson":
            addGeoJson(map, layer);
            break;
    }
}

function addTileset(map, layer) {
    map.addSource(layer.layerTitle, {
        'type': 'vector',
        'url': `mapbox://${layer.tilesetId}`
    });

    if (!map.getLayer(layer.layerTitle)) {
        map.addLayer({
            'id': layer.layerTitle,
            'type': 'circle',
            'source': layer.layerTitle,
            'source-layer': layer.sourcelayer,
            'paint': {
                'circle-radius': 5,
                'circle-color': layer.color
            }
        });
    } else {
        console.warn(`Layer ${layer.layerTitle} already exists`);
    }
}

function addGeoJson(map, layer) {
    map.addSource(layer.layerTitle, {
        type: "geojson",
        data: layer.data,
        cluster: layer.cluster,
        clusterMaxZoom: layer.clusterMaxZoom,
        clusterRadius: layer.clusterRadius
    });

    if (!map.getLayer(layer.layerTitle)) {
        addGeoJsonLayer(map, layer);
        addGeoJsonCluster(map, layer);
    } else {
        console.warn(`Layer ${layer.layerTitle} already exists`);
    }
}

function addGeoJsonLayer(map, layer) {
    if (layer.keyword === "sud/outpatient") {
        addSpecificLayer(map, layer, 'slots', 'yellow', 'SLOTS');
        addSpecificLayer(map, layer, 'beds', 'black', 'BEDS');
    } else {
        addGenericLayer(map, layer);
    }
}

function addSpecificLayer(map, layer, suffix, color, feature) {
    map.addLayer({
        'id': `${layer.layerTitle}-${suffix}-layer`,
        'type': 'circle',
        'source': `${layer.layerTitle}`,
        'paint': {
            'circle-color': color,
            'circle-opacity': 0.5, // Reduced opacity to visualize overlapping
            'circle-stroke-width': 1,
            'circle-stroke-color': 'black',
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', feature],
                0, 2, // Minimum number of feature corresponds to a minimum radius
                899, 40 // Maximum number of feature corresponds to a maximum radius
            ],
        }
    }, null);

    // Add label for the specific layer
    if (suffix === 'beds' || suffix === 'slots') {
        map.addLayer({
            'id': `${layer.layerTitle}-${suffix}-label`,
            'type': 'symbol',
            'source': `${layer.layerTitle}`,
            'layout': {
                'text-field': ['format',
                    ['get', 'BEDS'], { 'font-scale': 0.8 }, ' BEDS\n',
                    ['get', 'SLOTS'], { 'font-scale': 0.8 }, ' SLOTS'],
                'text-size': 12,
                'text-offset': [0, 2.3] // Move the label 2 units down
            },
            'paint': {
                'text-color': '#000'
            }
        });
    }
}

function addGenericLayer(map, layer) {
    map.addLayer({
        'id': layer.layerTitle,
        'type': 'circle',
        'source': layer.layerTitle,
        'paint': {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'BEDS'],
                0, 2,
                899, 40
            ],
            'circle-color': layer.color,
            'circle-opacity': 0.65, // Reduced opacity to visualize overlapping
            'circle-stroke-width': 1,
            'circle-stroke-color': 'white'
        }
    });
}

function addGeoJsonCluster(map, layer) {
    if (layer.cluster) {
        map.addLayer({
            'id': `${layer.layerTitle}-cluster`,
            'type': 'circle',
            'source': layer.layerTitle,
            'filter': ['has', 'point_count'],
            'paint': getClusterPaintConfig(layer)
        });

        addBedsSlotsLayer(map, layer);
        addClusterCountLayer(map, layer);
    }
}

function getClusterPaintConfig(layer) {
    return {
        'circle-color': [
            'step',
            ['get', 'point_count'],
            `${layer.color}`,
            50,
            `${layer.color}`,
            100,
            `${layer.color}`
        ],
        'circle-opacity': 1,
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            10,
            12.5,
            20,
            25,
            40,
            50,
            60,
            100,
            80
        ]
    }
}

function addBedsSlotsLayer(map, layer) {
    let textField = layer.keyword === 'sud/outpatient'
        ? ['concat', ['get', 'BEDS'], ' Beds\n', ['get', 'SLOTS'], ' Slots']
        : ['concat', ['get', 'BEDS'], '\nbeds'];

    map.addLayer({
        'id': `${layer.layerTitle}-beds-layer`,
        'type': 'symbol',
        'source': `${layer.layerTitle}`,
        'layout': {
            'text-field': textField,
            'text-size': 12,
            'symbol-placement': 'point',
        },
        'paint': {
            'text-color': '#000'
        }
    }, null);
}

function addClusterCountLayer(map, layer) {
    map.addLayer({
        'id': `${layer.layerTitle}-cluster-count`,
        'type': 'symbol',
        'source': `${layer.layerTitle}`,
        'filter': ['has', 'point_count'],
        'layout': getClusterCountLayout(layer)
    }, null);
}

function getClusterCountLayout(layer) {
    return {
        'text-field': layer.keyword
            ? ['concat', ['get', 'point_count_abbreviated'], `\n${layer.keyword}`]
            : ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'symbol-placement': 'point',
    };
}

export function handleLayer(map, dataset) {
    // For every index in the dataset, if the layer is enabled, draw it, else remove it
    dataset.forEach(layer => {
        if (layer.enabled) {
            addLayer(map, layer);
        } else {
            // Define the layer suffixes
            const suffixes = ['cluster', 'beds-layer', 'slots-layer', 'cluster-count', 'beds-label', 'slots-label'];

            // Loop through each suffix and remove the corresponding layer if it exists
            suffixes.forEach(suffix => {
                const layerId = `${layer.layerTitle}-${suffix}`;
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
            });

            // Remove the main layer if it exists
            if (map.getLayer(layer.layerTitle)) {
                map.removeLayer(layer.layerTitle);
            }

            // Remove the source if it exists
            if (map.getSource(layer.layerTitle)) {
                map.removeSource(layer.layerTitle);
            }
        }
    });
}

export function createPopup(map, popup, e, features) {
    if (!features.length) {
        return;
    }

    let feature = features[0]; // the topmost feature
    let properties = feature.properties;
    let description = '';
    let name = properties['DBA NAME'] || properties['Name'] || properties['NAME'] || properties['LEGAL NAME'] || properties['Business Unit'] || properties['Unit Name'] || properties['FULL ADDRESS'] || 'NAME NOT FOUND';
    let header = `<h2>${name}</h2>`;
    for (let property in properties) {
        description += `<strong>${property}:</strong> ${properties[property]}<br>`;
    }

    // Update the content and position of the existing popup instance
    popup.setLngLat(e.lngLat)
        .setHTML(header + description)
        .addTo(map);
}

export const convertMilesToMeters = (miles) => {
    return miles * 1609.34;
}



