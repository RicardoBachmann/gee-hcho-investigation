// === IMPORTS ===
var aoiStats = require("users/rcrdbchmnn/hcho-investigation:analysis/aoi-stats");
var firms = require("users/rcrdbchmnn/hcho-investigation:data-processing/firms");
var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");
var no2Processor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-no2");
var ndviProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel2-ndvi");
var raddProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/radd");
var criticalZoneProcessor = require("users/rcrdbchmnn/hcho-investigation:analysis/multi-sensor");

// === AREAS OF INTERESTS ===

var AOI_AMAZON = ee.Geometry.Rectangle([-73, -15, -44, 5]);
Map.addLayer(
  ee.Image().paint(AOI_AMAZON, 0, 2),
  { palette: "e37d05" },
  "Area of interest: Amazon",
);

var AOI_TAPAJOS = ee.Geometry.Rectangle([-61, -11, -54, -2]);
Map.addLayer(
  ee.Image().paint(AOI_TAPAJOS, 0, 2),
  { palette: "1d6b99" },
  "Area of interest: Tapajos Basin",
);

// === GET DATA-PROCESSING  ===

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

var radd_monthlyTapajos = raddProcessor.getMonthlyComposite(
  "2024",
  9,
  AOI_TAPAJOS,
);

// === MAP-LAYERS  ===

// === Main Layers
// Shows spatially where within the AOI the pixels lie above the baseline(2019-2023) —
// the red pixels on the map are the locations causing the outlier in the "Yearly September HCHO Concentration chart
Map.addLayer(
  hcho_anomalyTapajos,
  hchoProcessor.hchoAnomalyVis,
  "HCHO Anomaly Signals - Sep.2024",
  false,
);
Map.addLayer(
  no2_anomalyTapajos,
  no2Processor.no2AnomalyVis,
  "NO2 Anomaly Signals - Sep.2024",
  false,
);

// HCHO/NO2 Discriminator
Map.addLayer(
  ratioSep2024,
  criticalZoneProcessor.ratioVis,
  "HCHO/NO2 Ratio - Sep.2024",
  false,
);

// Environmental Stressors
Map.addLayer(
  ndvi_anomalyTapajos,
  ndviProcessor.ndviAnomalyVis,
  "NDVI Anomaly Signals - Sep.2024",
  true,
);
Map.addLayer(
  fire_monthlyTapajos,
  firms.firesVis,
  "FIRMS Fires - Sep.2024",
  false,
);
Map.addLayer(
  radd_monthlyTapajos,
  raddProcessor.raddVis,
  "RADD Disturbance - Sep.2024",
  true,
);

// Critical Zones
Map.addLayer(
  criticalZoneProcessor.getCriticalZones(AOI_TAPAJOS).selfMask(),
  { palette: ["red"] },
  "Critical Zones - Sep.2024",
  true,
);

// === Comparison Layers (inactive)
/*
  Map.addLayer(hcho_yearlyAmazon, hchoProcessor.hchoVis, "HCHO Amazon - Year.2024", false);
  Map.addLayer(hcho_yearlyTapajos, hchoProcessor.hchoVis, "HCHO Tapajos - Year.2024", false);
  Map.addLayer(hcho_monthlyAmazon, hchoProcessor.hchoVis, "HCHO Amazon - Sep.2024", false);
  Map.addLayer(hcho_monthlyTapajos, hchoProcessor.hchoVis, "HCHO Tapajos - Sep.2024", false);
 
  Map.addLayer(no2_yearlyAmazon, no2Processor.no2Vis, "NO2 Amazon - Year.2024", false);
  Map.addLayer(no2_yearlyTapajos, no2Processor.no2Vis, "NO2 Tapajos - Year.2024", false);
  Map.addLayer(no2_monthlyAmazon, no2Processor.no2Vis, "NO2 Amazon - Sep.2024", false);
  Map.addLayer(no2_monthlyTapajos, no2Processor.no2Vis, "NO2 Tapajos - Sep.2024", false);
  
  Map.addLayer(fire_yearlyAmazon, firms.firesVis, "FIRMS Fires Amazon - Year.2024", false);
  Map.addLayer(fire_yearlyTapajos, firms.firesVis, "FIRMS Fires Tapajos - Year.2024", false);

  Map.addLayer(ndvi_yearlyTapajos, ndviProcessor.ndviVis, "NDVI Tapajos - Year.2019", false);
  Map.addLayer(ndvi_yearlyTapajos2024, ndviProcessor.ndviVis, "NDVI Tapajos - Year.2024", false);
  Map.addLayer(ndvi_monthlyTapajos, ndviProcessor.ndviVis, "NDVI Tapajos - Sep.2024", false);
  */

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
aoiStats.buildYearlySeptemberRatioChart(AOI_TAPAJOS, no2RatioThreshold);
