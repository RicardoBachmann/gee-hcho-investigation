// Multi-sensor tool
var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");

var getCriticalZones = function (geometryTapajos) {
  var hcho_anomaly = hchoProcessor.getAnomalyComposite(geometryTapajos);

  print(
    hcho_anomaly.reduceRegion({
      reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), "mean", true),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    }),
  );
};

exports.getCriticalZones = getCriticalZones;
