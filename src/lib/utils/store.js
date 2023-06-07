import { writable } from 'svelte/store';

export const mapState = writable({
    map: null,
});

export const labelState = writable({
    activeColor: 'white',
    activeEditor: null,
    editors: new Map(),
    labels: {},
});
        
export const styleState = writable({
    style: null,
    styles: [
        { url: 'mapbox://styles/mapbox/streets-v12', name: 'streets-v12' },
        { url: 'mapbox://styles/mapbox/outdoors-v12', name: 'outdoors-v12' },
        { url: 'mapbox://styles/mapbox/light-v11', name: 'light-v11' },
        { url: 'mapbox://styles/mapbox/dark-v11', name: 'dark-v11' },
        { url: 'mapbox://styles/mapbox/satellite-v9', name: 'satellite-v9' },
        { url: 'mapbox://styles/mapbox/satellite-streets-v12', name: 'satellite-streets-v12' },
        { url: 'mapbox://styles/mapbox/navigation-day-v1', name: 'navigation-day-v1' },
        { url: 'mapbox://styles/mapbox/navigation-night-v1', name: 'navigation-night-v1' },
    ]
});

export const toolState = writable({
    tool: null
});



export const circleState = writable({
    radius: null,
    color: "#ff0000",
    circles: {}
});


export const choroSettings = writable({
    layerTitles: [],
    selectedLayer: 'None',
    colorSteps: 8,
    startColor: '#f7fbff',
    endColor: '#08306b',
});

export const datasetState = writable([
    {
        layerTitle: 'OTP',
        enabled: false,
        cluster: false,
        color: '#2d5093',
        sourcelayer: 'DTX_list_-_DTX_FINAL-19nx7m',
        tilesetId: 'ethanzawadzke.ao961pfm',
        type: 'tileset',
    },
    {
        layerTitle: 'OBOT',
        enabled: false,
        cluster: false,
        color: '#864241',
        sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
        tilesetId: 'ethanzawadzke.de1ir845',
        type: 'tileset',
    }, 
    {
        layerTitle: 'OTP Competitors',
        enabled: false,
        cluster: false,
        color: '#ff0000',
        sourcelayer: 'OBOT_Competiors_-8g2bza',
        tilesetId: 'ethanzawadzke.a9bcsbgf',
        type: 'tileset',
    },
    {
        layerTitle: 'OBOT Competitors',
        enabled: false,
        cluster: false,
        color: '#ff0000',
        sourcelayer: 'OBOT_Competiors_-8g2bza',
        tilesetId: 'ethanzawadzke.a9bcsbgf',
        type: 'tileset',
    },
    {
        layerTitle: "Prospective Real Estate (Select last)",
        keyword: "realestate",
        enabled: false,
        cluster: false,
        color: "lightgreen",
        sourcelayer: "Texas_Data_Sets_for_MAP__-_Sh-alm75l",
        tilesetId: 'ethanzawadzke.89q6m5fi',
        type: "tileset",
    },
    {
        layerTitle: "Psychiatric Hospitals",
        keyword: "psych hospitals",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 35,
        enabled: false,
        color: "#E79600",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20Psych%20Hospitals%20%20(1).geojson",
    },
    {
        layerTitle: "BEDS",
        keyword: "RTC locations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "magenta",
        type: "geojson",
        data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson'
    },
    {
        layerTitle: "SLOTS",
        keyword: "OP locations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "yellow",
        type: "geojson",
        data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson'
    },
    {
        layerTitle: "SUD RTCs and Outpatient",
        keyword: "Sud/OP locations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "yellow",
        type: "geojson",
        data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson'
    },
    {
        layerTitle: "General Hospitals",
        keyword: "general hospitals",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20General%20Hospitals%20%20(2).geojson',
        enableFilterMenu: true,
    },
    {
        layerTitle: "ANTEPARTUM",
        keyword: "antepartum\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20ANTEPARTUM.geojson"
    },
    {
        layerTitle: "CHEMICAL DEPENDENCY",
        keyword: "chem. dependency\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20CHEMICAL%20DEPENDENCY.geojson"
    },
    {
        layerTitle: "COMP MED REHAB",
        keyword: "comp. med. rehab\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20COMP%20MED%20REHAB.geojson"
    },
    {
        layerTitle: "CONTINUING CARE",
        keyword: "continuing care\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20CONTINUING%20CARE.geojson"
    },
    {
        layerTitle: "ICU_CCU",
        keyword: "icu/ccu\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20ICU_CCU.geojson"
    },
    {
        layerTitle: "INTERMEDIATE CARE",
        keyword: "intermediate care\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20INTERMEDIATE%20CARE.geojson"
    },
    {
        layerTitle: "LDRP",
        keyword: "ldrp\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20LDRP.geojson"
    },
    {
        layerTitle: "MED_SURG",
        keyword: "med/surg\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20MED_SURG.geojson"
    },
    {
        layerTitle: "NICU",
        keyword: "nicu\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20NICU.geojson"
    },
    {
        layerTitle: "PEDIATRIC",
        keyword: "pediatric\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20PEDIATRIC.geojson"
    },
    {
        layerTitle: "POSTPARTUM",
        keyword: "postpartum\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20POSTPARTUM.geojson"
    },
    {
        layerTitle: "PSYCH",
        keyword: "psychiatric\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20PSYCH.geojson"
    },
    {
        layerTitle: "SKILLED NURSING",
        keyword: "skilled nursing\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20SKILLED%20NURSING.geojson"
    },
    {
        layerTitle: "UNIVERSAL CARE",
        keyword: "universal care\nlocations",
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 50,
        enabled: false,
        color: "blue",
        type: "geojson",
        data: "https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/General%20Hospital%20Individual%20Bed%20Types/GH%20-%20UNIVERSAL%20CARE.geojson"
    },
    {
        layerTitle: "SUD RTCs and Outpatient Heatmap Test",
        keyword: "heatmap",
        enabled: false,
    },
]);
