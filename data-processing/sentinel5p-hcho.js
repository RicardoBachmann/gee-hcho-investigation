// Sentinel-5P TROPOMI HCHO (Formaldehyd) data processing
// Collection: COPERNICUS/S5P/OFFL/L3_HCHO
// QA filter: cloud_fraction < 0.5 (used for consistency with NO2 filter)
// Provides: yearly, monthly and anomaly composites also Timelaps functionality

var SENTINEL5P_HCHO = "COPERNICUS/S5P/OFFL/L3_HCHO";
var s5p_hcho = ee.ImageCollection(SENTINEL5P_HCHO);
var MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

exports.getYearlyComposite = function (year, aoi) {
  return (
    s5p_hcho
      .filterDate(year + "-01-01", year + "-12-31")
      .filterBounds(aoi)
      // Implement QA-Filter (Quality score 0-1)
      // Cloud_fraction < 0.5 used instead of qa_value for consistency with NO2 filter
      // (unlike HCHO, NO2 L3 product has no qa_value band in GEE)
      .map(function (img) {
        var cloudMasked = img.select("cloud_fraction").lt(0.5);
        return img.updateMask(cloudMasked);
      })
      .select("tropospheric_HCHO_column_number_density")
      .mean()
      .clip(aoi)
  );
};

var getMonthlyComposite = function (year, month, aoi) {
  var monthString = ee.Number(month).format("%02d"); // converts 8 into String "08"
  var startDate = ee.String(year).cat("-").cat(monthString).cat("-01"); // date String "2024-08-01"
  var endDate = ee.Date(startDate).advance(1, "month"); // takes start date and added 1 month. No matter how many days a month have

  return s5p_hcho
    .filterDate(startDate, endDate)
    .filterBounds(aoi)
    .map(function (img) {
      var cloudMasked = img.select("cloud_fraction").lt(0.5);
      return img.updateMask(cloudMasked);
    })
    .select("tropospheric_HCHO_column_number_density")
    .mean()
    .clip(aoi);
};

exports.getMonthlyComposite = getMonthlyComposite;

var getAnomalyComposite = function (aoi) {
  //  1 Image-Signal (Sep 2024) minus 5 Images-Baseline(2019-2023) = Anomaly?

  var img2019 = getMonthlyComposite("2019", 9, aoi);
  var img2020 = getMonthlyComposite("2020", 9, aoi);
  var img2021 = getMonthlyComposite("2021", 9, aoi);
  var img2022 = getMonthlyComposite("2022", 9, aoi);
  var img2023 = getMonthlyComposite("2023", 9, aoi);

  var img2024 = getMonthlyComposite("2024", 9, aoi);

  var baselineCollection = ee.ImageCollection([
    img2019,
    img2020,
    img2021,
    img2022,
    img2023,
  ]);
  var collectionMean = baselineCollection.mean();

  var anomalySignal2024 = img2024.subtract(collectionMean);

  return anomalySignal2024;
};

// === TIMELAPS ===

var getTimelapsCollection = function (year, aoi) {
  var images = [];

  MONTHS.forEach(function (month) {
    var hchoImages = getMonthlyComposite(year, month, aoi);
    images.push(hchoImages);
  });

  return ee.ImageCollection(images);
};

var hchoVis = {
  min: 0.0,
  max: 0.0005,
  palette: ["black", "blue", "purple", "cyan", "green", "yellow", "red"],
};

var hchoAnomalyVis = {
  min: -0.0002,
  max: 0.0002,
  palette: ["black", "blue", "purple", "cyan", "green", "yellow", "red"],
};

exports.hchoVis = hchoVis;
exports.s5p_hcho = s5p_hcho;
exports.hchoAnomalyVis = hchoAnomalyVis;
exports.getAnomalyComposite = getAnomalyComposite;
exports.getTimelapsCollection = getTimelapsCollection;
