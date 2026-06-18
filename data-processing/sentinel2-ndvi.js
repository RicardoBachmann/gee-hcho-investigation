// Sentinel-2 NDVI (Normalized Difference Vegetation Index) data processing
// Collection: COPERNICUS/S2_SR_HARMONIZED
// Cloud mask: SCL band (4=Vegetation, 5=BareSoil, 6=Water, 11=Snow)
// Provides: yearly, monthly and anomaly composites

var SENTINEL2_NDVI = "COPERNICUS/S2_SR_HARMONIZED";

var s2_ndvi = ee.ImageCollection(SENTINEL2_NDVI);

var getYearlyComposite = function (year, aoi) {
  // Calculate normalized difference vegetation index: (NIR - Red) / (NIR + Red)
  var nirBand = "B8";
  var redBand = "B4";

  return (
    s2_ndvi
      .filterDate(year + "-01-01", year + "-12-31")
      .filterBounds(aoi)
      // Cloud mask for better pixel detection
      // calculate and return one band B8 & B4
      .map(function (img) {
        var scl = img.select("SCL");
        // 4=Vegetation, 5= BareSoil, 6=Water, 11=Snow A pixel is retained if at least one condition is met
        var cloudMask = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(11));

        return img
          .updateMask(cloudMask)
          .normalizedDifference([nirBand, redBand]);
      })
      // combine all these NDVI images into a single average/mean image
      .mean()
      .clip(aoi)
  );
};

var getMonthlyComposite = function (year, month, aoi) {
  // Calculate normalized difference vegetation index: (NIR - Red) / (NIR + Red)
  var nirBand = "B8";
  var redBand = "B4";

  var monthString = ee.Number(month).format("%02d"); // converts number into string
  var startDate = ee.String(year).cat("-").cat(monthString).cat("-01"); // date(string) "2024-09-01"
  var endDate = ee.Date(startDate).advance(1, "month"); // takes startDate and add to the next month, no matter if 28,30 or 31 days

  return (
    s2_ndvi
      .filterDate(startDate, endDate)
      .filterBounds(aoi)
      // Cloud mask for better pixel detection
      // calculate and return one band B8 & B4
      .map(function (img) {
        var scl = img.select("SCL"); // Scene Classification Layer
        // 4=Vegetation, 5= BareSoil, 6=Water, 11=Snow A pixel is retained if at least one condition is met
        var cloudMask = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(11));
        return img
          .updateMask(cloudMask)
          .normalizedDifference([nirBand, redBand]);
      })
      // combine all these NDVI images into a single average/mean image
      .mean()
      .clip(aoi)
  );
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
  var meanCollection = baselineCollection.mean();

  var anomalySignal2024 = img2024.subtract(meanCollection);

  return anomalySignal2024;
};

var ndviVis = {
  min: -0.5,
  max: 1,
  palette: ["blue", "white", "green"],
};

var ndviAnomalyVis = {
  min: -1,
  max: 1,
  palette: ["red", "white", "green"],
};

exports.getYearlyComposite = getYearlyComposite;
exports.getMonthlyComposite = getMonthlyComposite;
exports.getAnomalyComposite = getAnomalyComposite;
exports.ndviVis = ndviVis;
exports.ndviAnomalyVis = ndviAnomalyVis;
