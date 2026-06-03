// === IMPORTS ===
var aoiStats = require("users/rcrdbchmnn/hcho-investigation:analysis/aoi-stats");
var firms = require("users/rcrdbchmnn/hcho-investigation:data-processing/firms");
var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");
var no2Processor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-no2");
var ndviProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel2-ndvi");
var raddProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/radd");

// === AREAS OF INTERESTS ===

var AOI_AMAZON = ee.Geometry.Rectangle([-73, -15, -44, 5]);
Map.addLayer(
  ee.Image().paint(AOI_AMAZON, 0, 2),
  { palette: "blue" },
  "Area of interest: Amazon",
);

var AOI_TAPAJOS = ee.Geometry.Rectangle([-61, -11, -54, -2]);
Map.addLayer(
  ee.Image().paint(AOI_TAPAJOS, 0, 2),
  { palette: "green" },
  "Area of interest: Tapajos Basin",
);

// === DATA LAYERS ===

var hcho_yearlyAmazon = hchoProcessor.getYearlyComposite("2024", AOI_AMAZON);
var hcho_monthlyAmazon = hchoProcessor.getMonthlyComposite(
  "2024",
  9,
  AOI_AMAZON,
);
var hcho_yearlyTapajos = hchoProcessor.getYearlyComposite("2024", AOI_TAPAJOS);
var hcho_monthlyTapajos = hchoProcessor.getMonthlyComposite(
  "2024",
  9,
  AOI_TAPAJOS,
);
var hcho_anomalyTapajos = hchoProcessor.getAnomalyComposite(AOI_TAPAJOS);

var no2_yearlyAmazon = no2Processor.getYearlyComposite("2024", AOI_AMAZON);
var no2_monthlyAmazon = no2Processor.getMonthlyComposite("2024", 9, AOI_AMAZON);
var no2_yearlyTapajos = no2Processor.getYearlyComposite("2024", AOI_TAPAJOS);
var no2_monthlyTapajos = no2Processor.getMonthlyComposite(
  "2024",
  9,
  AOI_TAPAJOS,
);
var no2_anomalyTapajos = no2Processor.getAnomalyComposite(AOI_TAPAJOS);

var fire_yearlyAmazon = firms.getYearlyComposite("2024", AOI_AMAZON);
var fire_yearlyTapajos = firms.getYearlyComposite("2024", AOI_TAPAJOS);
var fire_monthlyTapajos = firms.getMonthlyComposite("2024", 9, AOI_TAPAJOS);

var ndvi_yearlyTapajos = ndviProcessor.getYearlyComposite("2019", AOI_TAPAJOS);
var ndvi_yearlyTapajos2024 = ndviProcessor.getYearlyComposite(
  "2024",
  AOI_TAPAJOS,
);
var ndvi_monthlyTapajos = ndviProcessor.getMonthlyComposite(
  "2024",
  9,
  AOI_TAPAJOS,
);
var ndvi_anomalyTapajos = ndviProcessor.getAnomalyComposite(AOI_TAPAJOS);

print(
  ndvi_anomalyTapajos.reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: AOI_TAPAJOS,
    scale: 1000,
    maxPixels: 1e9,
  }),
);

var radd_monthlyTapajos = raddProcessor.getMonthlyComposite(
  "2024",
  9,
  AOI_TAPAJOS,
);

Map.addLayer(
  ndvi_yearlyTapajos,
  ndviProcessor.ndviVis,
  "NDVI - Tapajos 2019",
  true,
);
Map.addLayer(
  ndvi_yearlyTapajos2024,
  ndviProcessor.ndviVis,
  "NDVI - Tapajos 2024",
  true,
);
Map.addLayer(
  ndvi_monthlyTapajos,
  ndviProcessor.ndviVis,
  "NDVI - Tapajos Sep.2024",
  true,
);
Map.addLayer(
  ndvi_anomalyTapajos,
  ndviProcessor.ndviAnomalyVis,
  "NDVI - Anomaly Signals",
  true,
);

Map.addLayer(
  fire_yearlyAmazon,
  firms.firesVis,
  "Amazon - Sensing Fires 2024",
  false,
);
Map.addLayer(
  fire_yearlyTapajos,
  firms.firesVis,
  "Tapajos - Sensing Fires 2024",
  false,
);
Map.addLayer(
  fire_monthlyTapajos,
  firms.firesVis,
  "Tapajos - Sensing Fires Sep 2024",
  false,
);

Map.addLayer(
  hcho_yearlyAmazon,
  hchoProcessor.hchoVis,
  "Amazon - HCHO 2024",
  false,
);
Map.addLayer(
  hcho_monthlyAmazon,
  hchoProcessor.hchoVis,
  "Amazon - HCHO 09.2024",
  false,
);
Map.addLayer(
  hcho_yearlyTapajos,
  hchoProcessor.hchoVis,
  "Tapajos - HCHO 2024",
  false,
);
Map.addLayer(
  hcho_monthlyTapajos,
  hchoProcessor.hchoVis,
  "Tapajos - HCHO 09.2024",
  false,
);

// Shows spatially where within the AOI the pixels lie above the baseline(2019-2023) —
// the red pixels on the map are the locations causing the outlier in the "Yearly September HCHO Concentration chart
Map.addLayer(
  hcho_anomalyTapajos,
  hchoProcessor.hchoAnomalyVis,
  "Tapajos - HCHO Sep 2024 Anomaly Signals",
  false,
);
Map.addLayer(
  no2_anomalyTapajos,
  no2Processor.no2AnomalyVis,
  "Tapajos - NO2 Sep 2024 Anomaly Signals",
  false,
);

// HCHO NO2 Ratio-Layers
// .divide() applied to both Sep 2024 composites
// This shows spatially where the signal is predominantly pyrogenic (anthropogenic) and where it is more
// biogenic transported
var ratioSep2024 = hcho_monthlyTapajos.divide(no2_monthlyTapajos);
var ratioVis = {
  min: 0,
  max: 50,
  palette: ["ffffff", "ffcccc", "ff6666", "cc0000", "7a0000"],
};

print(
  ratioSep2024.reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: AOI_TAPAJOS,
    scale: 5000,
    maxPixels: 1e9,
  }),
);

Map.addLayer(ratioSep2024, ratioVis, "HCHO & NO2 Ratio 2024", false);

Map.addLayer(no2_yearlyAmazon, no2Processor.no2Vis, "Amazon - NO2 2024", false);
Map.addLayer(
  no2_yearlyTapajos,
  no2Processor.no2Vis,
  "Tapajos - NO2 2024",
  false,
);
Map.addLayer(
  no2_monthlyAmazon,
  no2Processor.no2Vis,
  "Amazon - NO2 09.2024",
  false,
);
Map.addLayer(
  no2_monthlyTapajos,
  no2Processor.no2Vis,
  "Tapajos - NO2 09.2024",
  false,
);

Map.addLayer(
  radd_monthlyTapajos,
  raddProcessor.raddVis,
  "RADD Disturbance - Sep2024",
  true,
);

// === CHARTS ===

aoiStats.buildAnnualChart(AOI_AMAZON, AOI_TAPAJOS);
aoiStats.buildMonthlyChart(AOI_AMAZON, AOI_TAPAJOS);
aoiStats.buildYearlySeptemberHchoChart(AOI_TAPAJOS);

aoiStats.buildAnnualNo2Chart(AOI_AMAZON, AOI_TAPAJOS);
aoiStats.buildMonthlyNo2Chart(AOI_AMAZON, AOI_TAPAJOS);
aoiStats.buildYearlySeptemberNo2Chart(AOI_TAPAJOS);

aoiStats.buildAnnualFirmsChart(AOI_AMAZON, AOI_TAPAJOS);
aoiStats.buildMonthlyFirmsChart(AOI_AMAZON, AOI_TAPAJOS);

aoiStats.buildYearlySeptemberNdviChart(AOI_TAPAJOS);
