var SENTINEL5P_NO2 = "COPERNICUS/S5P/OFFL/L3_NO2";
var s5p_no2 = ee.ImageCollection(SENTINEL5P_NO2);
var MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

exports.getYearlyComposite = function (year, aoi) {
  return (
    s5p_no2
      .filterDate(year + "-01-01", year + "-12-31")
      .filterBounds(aoi)
      // Implement QA-Filter (Quality score 0-1)
      // TROPOMI doc suggest qa_value 0.5 as standard screening to avoid data issues like cloud cover or data-noise
      .map(function (img) {
        var qaValue = img.select("cloud_fraction").lt(0.5);
        return img.updateMask(qaValue);
      })
      .select("tropospheric_NO2_column_number_density")
      .mean()
      .clip(aoi)
  );
};

var getMonthlyComposite = function (year, month, aoi) {
  var monthString = ee.Number(month).format("%02d");
  var startDate = ee.String(year).cat("-").cat(monthString).cat("-01");
  var endDate = ee.Date(startDate).advance(1, "month");

  return s5p_no2
    .filterDate(startDate, endDate)
    .filterBounds(aoi)
    .map(function (img) {
      var qaValue = img.select("cloud_fraction").lt(0.5);
      return img.updateMask(qaValue);
    })
    .select("tropospheric_NO2_column_number_density")
    .mean()
    .clip(aoi);
};

var getAnomalyComposite = function (aoi) {
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
  var baselineMean = baselineCollection.mean();

  var anomalySignal2024 = img2024.subtract(baselineMean);

  return anomalySignal2024;
};

// === TIMELAPS

var getTimelapsCollection = function (year, aoi) {
  var images = [];

  MONTHS.forEach(function (month) {
    var no2Images = getMonthlyComposite(year, month, aoi);
    images.push(no2Images);
  });

  return ee.ImageCollection(images);
};

exports.getTimelapsCollection = getTimelapsCollection;

// Dark color code
var no2Vis = {
  min: 0,
  max: 0.0003,
  palette: ["black", "blue", "purple", "cyan", "green", "yellow", "red"],
};

var no2AnomalyVis = {
  min: -0.00002,
  max: 0.00002,
  palette: ["ffffff", "ffcccc", "ff6666", "cc0000", "7a0000"],
};

// Light color code
/*
var no2Vis = {
  min: 0,
  max: 0.0003,
  palette: ['white', 'red']
};*/

exports.no2Vis = no2Vis;
exports.getMonthlyComposite = getMonthlyComposite;
exports.getAnomalyComposite = getAnomalyComposite;
exports.no2AnomalyVis = no2AnomalyVis;
