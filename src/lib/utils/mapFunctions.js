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
    if (map.getLayer("choro-data-layer-border")) {
        map.removeLayer("choro-data-layer-border");
    }
}

export function drawLayer(layerTitle, map) { // <-- pass map as a parameter
    return new Promise((resolve, reject) => {
        const validTitles = [
            'Median Income Rank (0-99)',
            'Professional (%)',
            'Population',
            'Median Rooms In Home',
            'AWATER10',
            'city',
            'state_id',
            'state_name',
            'zcta',
            'parent_zcta',
            'population',
            'density',
            'county_fips',
            'county_name',
            'county_weights',
            'county_names_all',
            'county_fips_all',
            'imprecise',
            'military',
            'timezone',
            'age_median',
            'age_under_10',
            'age_10_to_19',
            'age_20s',
            'age_30s',
            'age_40s',
            'age_50s',
            'age_60s',
            'age_70s',
            'age_over_80',
            'male',
            'female',
            'married',
            'divorced',
            'never_married',
            'widowed',
            'family_size',
            'family_dual_income',
            'income_household_median',
            'income_household_under_5',
            'income_household_5_to_10',
            'income_household_10_to_15',
            'income_household_15_to_20',
            'income_household_20_to_25',
            'income_household_25_to_35',
            'income_household_35_to_50',
            'income_household_50_to_75',
            'income_household_75_to_100',
            'income_household_100_to_150',
            'income_household_150_over',
            'income_household_six_figure',
            'income_individual_median',
            'home_ownership',
            'housing_units',
            'home_value',
            'rent_median',
            'rent_burden',
            'education_less_highschool',
            'education_highschool',
            'education_some_college',
            'education_bachelors',
            'education_graduate',
            'education_college_or_above',
            'education_stem_degree',
            'labor_force_participation',
            'unemployment_rate',
            'self_employed',
            'farmer',
            'race_white',
            'race_black',
            'race_asian',
            'race_native',
            'race_pacific',
            'race_other',
            'race_multiple',
            'hispanic',
            'disabled',
            'poverty',
            'limited_english',
            'commute_time',
            'health_uninsured',
            'veteran',
            'charitable_givers',
            'cbsa_fips',
            'cbsa_name',
            'cbsa_metro',
            'csa_fips',
            'csa_name',
            'metdiv_fips',
            'metdiv_name'
        ];

        let test = null; 

        console.log("STARTING LAYER TITLE: " + layerTitle)

        if (layerTitle !== "None") {
            if (layerTitle === "ENROLLED PCT") {
                console.log('Layer set to ENROLLED PCT')
                test = 'clihvcvkk12832dp41bdytixx'
            } else if (validTitles.includes(layerTitle)) {
                console.log('Layer set to Texas Zip Code Data')
                console.log(layerTitle)
                test ='clj6y2qrc20dc2hnxzx8r30c5'
            } else {
                test = null;
            }

            let selectedLayer, colorSteps;

            const unsubscribe = choroSettings.subscribe(state => {
                selectedLayer = state.selectedLayer;
                colorSteps = state.colorSteps;
            });

            let url;
            let source;

            if (test !== null) {
                if (layerTitle === 'ENROLLED PCT') {
                    source = 'txlunchdatafinal'
                } else if (validTitles.includes(layerTitle)) {
                    source = 'txzips-6-22-2023-lean'
                }
            } else {
                source = 'counties-dataset'
            }

            if (test !== null) {
                if (layerTitle  === 'ENROLLED PCT') {
                    url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${test}/features?limit=50&access_token=${accessToken}`;
                } else if (validTitles.includes(layerTitle)) {
                    url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${test}/features?limit=50&access_token=${accessToken}`;
                }
                else {
                    url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;
                }
                
            } else {
                url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;
            }
            

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let minPop = Infinity;
                    let maxPop = -Infinity;
                    for (let feature of data.features) {
                        let pop;
                        if (feature.properties.hasOwnProperty(selectedLayer) && feature.properties[selectedLayer] !== undefined && feature.properties[selectedLayer] !== "") {
                            pop = feature.properties[selectedLayer];
                            pop = typeof pop === 'string' ? parseFloat(pop) : pop;
                        } else {
                            pop = 0; // Set the value to 0 if the property does not exist or is an empty string
                        }


                        console.log(pop)
                        minPop = Math.min(minPop, pop);
                        maxPop = Math.max(maxPop, pop);
                        /* console.log(minPop, maxPop)
                        console.log(typeof minPop, typeof maxPop) */
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


                    map.addLayer({
                        'id': 'choro-data-layer-border',
                        'type': 'line',
                        'source': `${source}`,
                        'source-layer': `${source}`,
                        'paint': {
                            'line-color': '#000', // Border color, change this as needed
                            'line-width': 1 // Border thickness
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

    if (layer.keyword === 'realestate') {
        map.loadImage('https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/icon.png', function (error, image) {
            if (error) throw error;
            map.addImage('custom-marker', image);

            if (!map.getLayer(layer.layerTitle)) {
                map.addLayer({
                    'id': layer.layerTitle,
                    'type': 'symbol',
                    'source': layer.layerTitle,
                    'source-layer': layer.sourcelayer,
                    'layout': {
                        'icon-image': 'custom-marker',
                        // Optional: change scale of custom icon
                        'icon-size': .5
                    }
                });
            } else {
                console.warn(`Layer ${layer.layerTitle} already exists`);
            }
        });
    } else {
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
}

function addHeatmapLayer(map, layer) {
    map.addLayer({
        'id': layer.layerTitle,
        'type': 'heatmap',
        'source': layer.layerTitle,
        'maxzoom': 15,
        'paint': {
            // Increase the heatmap weight based on frequency and property magnitude
            'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'BEDS'],
                2, .002,
                500, 1
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 1,
                9, 3
            ],
            // Color ramp of heatmap. Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparency color
            // to create a blur-like effect.
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 3,
                9, 45
            ],
            // Transition from heatmap to circle layer by zoom level
            /* 'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7, 1,
                9, 0
            ], */
        }
    }, 'waterway-label');
}



async function addGeoJson(map, layer) {
    let data;

    // Only fetch and filter data if layer keyword is "RTC locations" or "OP locations"
    if (layer.keyword === 'RTC locations' || layer.keyword === 'OP locations') {
        let response = await fetch(layer.data);
        let geojsonData = await response.json();

        // Determine which property to filter on based on the keyword
        let propertyToFilter = layer.keyword === 'RTC locations' ? 'BEDS' : 'SLOTS';

        // Filter data
        data = filterGeoJsonData(geojsonData, propertyToFilter);
    } else {
        data = layer.data;
    }

    map.addSource(layer.layerTitle, {
        type: "geojson",
        data: data,
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

// Filter function now takes a property name to filter on
function filterGeoJsonData(geojsonData, property) {
    // Check and make sure features is an array as expected
    if (!Array.isArray(geojsonData.features)) {
        throw new Error('Expected geojsonData to have a features property that is an array');
    }

    // Filter out features where the given property is 0
    geojsonData.features = geojsonData.features.filter(feature => {
        return feature.properties[property] !== 0;
    });

    return geojsonData;
}


function addGeoJsonLayer(map, layer) {
    console.log(layer.heatmapEnabled)
    if (layer.keyword === "Sud/OP locations") {
        addSpecificLayer(map, layer, 'slots', 'yellow', 'SLOTS');
        addSpecificLayer(map, layer, 'beds', 'black', 'BEDS');
    } else if (layer.heatmapEnabled) {
        console.log('Adding heatmap layer');
        addHeatmapLayer(map, layer);
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
                0, 5, // Minimum number of feature corresponds to a minimum radius
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
                'text-offset': [0, 2.3], // Move the label 2 units down
                'text-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 0,     // At zoom level 10 or less, text size is 0 (invisible)
                    12, 12     // At zoom level 14 or more, text size is 12
                ]
            },
            'paint': {
                'text-color': '#000',
                // Increase text size as zoom level increases
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
                ['coalesce', ['get', 'BEDS'], ['get', 'SLOTS']],
                0, 5,
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
    let textField = layer.keyword === 'Sud/OP locations'
        ? ['concat', ['get', 'BEDS'], ' Beds\n', ['get', 'SLOTS'], ' Slots']
        : ['concat', ['get', 'BEDS'], '\nbeds'];

    if (layer.keyword === 'OP locations') {
        textField = ['concat', ['get', 'SLOTS'], '\nslots'];
    }

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
    console.log(features[0].properties['ZCTA5CE10']);

    let feature = features[0]; // the topmost feature
    let properties = feature.properties;
    let description = '';
    let name = properties['DBA NAME'] || properties['Name'] || properties['NAME'] || properties['LEGAL NAME'] || properties['Business Unit'] || properties['Unit Name'] || properties['FULL ADDRESS'] || properties['ZCTA5CE10'] || properties['zip'] || 'NAME NOT FOUND';
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


export function drawPointsLayer(selectedOverlay, overlayColor, map) {
    if (selectedOverlay === "None") {
        if (map.getLayer("zip-code-points")) {
            map.removeLayer("zip-code-points");
            map.removeSource("zip-code-points");
        }
    } else {
        fetch(`https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/txzips.geojson`)
            .then((response) => response.json())
            .then((data) => {
                if (map.getLayer("zip-code-points")) {
                    map.removeLayer("zip-code-points");
                    map.removeSource("zip-code-points");
                }

                // Initialize min and max with infinity and negative infinity
                let min = Infinity;
                let max = -Infinity;

                // Loop over the data to find the min and max
                for (const feature of data.features) {
                    const value = Number(feature.properties[selectedOverlay]);
                    if (!isNaN(value)) {
                        min = Math.min(min, value);
                        max = Math.max(max, value);
                    }
                }

                map.addSource("zip-code-points", {
                    type: "geojson",
                    data,
                });

                map.addLayer({
                    id: "zip-code-points",
                    type: "circle",
                    source: "zip-code-points",
                    paint: {
                        // Interpolate the circle radius based on the selected property
                        "circle-radius": [
                            "interpolate", ["linear"],
                            ["coalesce", ["to-number", ["get", selectedOverlay]], 1],
                            min, 2, // Map minimum data value to a radius of 1
                            max, 15 // Map maximum data value to a radius of 10
                        ],
                        "circle-color": overlayColor,
                    },
                });

                // Return min and max for the next then block
                return { min, max };
            })
            .then(({ min, max }) => {

                let overlayLegend = document.getElementById('overlay-legend');
                overlayLegend.innerHTML = `<h4>${selectedOverlay}</h4>`;

                // Calculate the step size
                const step = (max - min) / 4;

                for (let i = 0; i <= 4; i++) {
                    // Calculate the size of the circle
                    const circleSize = (min + step * i).toFixed(2);

                    // Calculate the radius of the circle
                    const radius = 4 + (28 * i / 4); // Adjust this formula as needed

                    // Add the circle and the label to the legend
                    overlayLegend.innerHTML +=
                        `<i style="background:${overlayColor};width:${radius}px;height:${radius}px;border-radius:50%;display:inline-block;"></i> ${circleSize}<br>`;
                }
            });


    }
}
