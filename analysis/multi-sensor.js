// Multi-sensor tool
var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");
var no2Processor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-no2");
var ndviProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel2-ndvi");
var firmsProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/firms");
var raddProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/radd");

var getCriticalZones = function (geometryTapajos) {
  var hchoAnomaly = hchoProcessor.getAnomalyComposite(geometryTapajos);
  var ndviAnomaly = ndviProcessor.getAnomalyComposite(geometryTapajos);

  // AOI: hcho-mean: 0.00013 - threshold set above mean for stronger signal
  var hchoThreshold = 0.00015;

  // AOI: ndvi-mean: -0.11299 - threshold set below mean
  var ndviThreshold = -0.3;

  var firmsMask = firmsProcessor
    .getMonthlyComposite("2024", 9, geometryTapajos)
    .unmask(0);
  var raddMask = raddProcessor
    .getMonthlyComposite("2024", 9, geometryTapajos)
    .unmask(0);

  // HCHO/NO2 Ratio
  var no2Composite = no2Processor.getMonthlyComposite(
    "2024",
    9,
    geometryTapajos,
  );
  var hchoComposite = hchoProcessor.getMonthlyComposite(
    "2024",
    9,
    geometryTapajos,
  );
  var no2Mask = no2Composite.updateMask(no2Composite.gt(0.00001017));
  var ratioCondition = hchoComposite.divide(no2Mask).gt(25);

  var hchoCondition = hchoAnomaly.gt(hchoThreshold);
  var ndviCondition = ndviAnomaly.lt(ndviThreshold);
  var firmsCondition = firmsMask.not();
  var raddCondition = raddMask.not();

  var criticalZoneCondition = hchoCondition
    .and(ndviCondition)
    .and(firmsCondition)
    .and(raddCondition)
    .and(ratioCondition);

  print(
    hchoAnomaly.reduceRegion({
      reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), "mean", true),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    }),
  );

  print(
    ndviAnomaly.reduceRegion({
      reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), "mean", true),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    }),
  );

  return criticalZoneCondition;
};

exports.getCriticalZones = getCriticalZones;
