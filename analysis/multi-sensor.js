// Critical Zone detection via 5-condition convergence (Sep.2024)
//
// A pixel qualifies as a Critical Zone only when ALL 5 conditions are true:
// 1. HCHO anomaly > threshold - elevated formaldehyde vs. 2019-2023 baseline
// 2. NDVI anomaly < threshold - vegetation stress vs. 2019-2023 baseline
// 3. FIRMS absent - no active fire detected at this pixel
// 4. RADD absent - no SAR-confirmed forest disturbance
// 5. HCHO/NO2 ratio > threshold - biogenic signal, not anthropogenic co-emission

// Threshold derived from Sep.2024 AOI statistics + sampling of inspected pixels

var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");
var no2Processor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-no2");
var ndviProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel2-ndvi");
var firmsProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/firms");
var raddProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/radd");

var ratioThreshold = 0.00001017;

var getRatioImage = function (geometryTapajos) {
  // Ratio condition: mask NO2 pixels near zero before division to prevent ratio instability
  // NO2 threshold = 1/3 of Sep.2024 regional mean (0.0000305 mol/m2) / 3 = 0.00001017 (conservative lower limit)
  var hchoComposite = hchoProcessor.getMonthlyComposite(
    "2024",
    9,
    geometryTapajos,
  );
  var no2Composite = no2Processor.getMonthlyComposite(
    "2024",
    9,
    geometryTapajos,
  );
  var no2Masked = no2Composite.updateMask(no2Composite.gt(ratioThreshold));

  return hchoComposite.divide(no2Masked);
};

var getCriticalZones = function (geometryTapajos) {
  var hchoAnomaly = hchoProcessor.getAnomalyComposite(geometryTapajos);
  var ndviAnomaly = ndviProcessor.getAnomalyComposite(geometryTapajos);

  // Set above AOI mean (0.00013 mol/m2) to isolate pixels with stronger than average anomaly
  var hchoThreshold = 0.00015;

  // Set below AOI mean (-0.113) - threshold requires clear vegetation stress, not marginal deviation.
  // Anchored in 3 sampled inspected forest pixels -0.212, -0.318, -0.220
  var ndviThreshold = -0.3;

  // FIRMS/RADD: .unmask(0) fills masked (no data) pixels with 0, then .not() inverts:
  // result is 1 where NO fire/disturbance was detected, 0 where fire/disturbance exists
  var firmsMasked = firmsProcessor
    .getMonthlyComposite("2024", 9, geometryTapajos)
    .unmask(0);
  var raddMasked = raddProcessor
    .getMonthlyComposite("2024", 9, geometryTapajos)
    .unmask(0);

  // Ratio threshold 25 is above regional mean (17.33) and above sampled inspected anthropogenic pixels (~3.5)
  var ratioCondition = getRatioImage(geometryTapajos).gt(25);

  var hchoCondition = hchoAnomaly.gt(hchoThreshold);
  var ndviCondition = ndviAnomaly.lt(ndviThreshold);
  var firmsCondition = firmsMasked.not();
  var raddCondition = raddMasked.not();

  var criticalZoneCondition = hchoCondition
    .and(ndviCondition)
    .and(firmsCondition)
    .and(raddCondition)
    .and(ratioCondition);

  return criticalZoneCondition;
};

var ratioVis = {
  min: 0,
  max: 50,
  palette: ["ffffff", "ffcccc", "ff6666", "cc0000", "7a0000"],
};

exports.getRatioImage = getRatioImage;
exports.getCriticalZones = getCriticalZones;
exports.ratioThreshold = ratioThreshold;
exports.ratioVis = ratioVis;
