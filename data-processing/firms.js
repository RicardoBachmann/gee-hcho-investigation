var FIRMS = "FIRMS";
var firmsData = ee.ImageCollection(FIRMS);

exports.getYearlyComposite = function (year, aoi) {
  return firmsData
    .filter(ee.Filter.date(year + "-01-01", year + "-12-31"))
    .filterBounds(aoi)
    .select("T21")
    .max()
    .clip(aoi);
};

var getMonthlyComposite = function (year, month, aoi) {
  var monthString = ee.Number(month).format("%02d"); // d=decimal, 2 = min. 2, 0 = fill blanks where necessary
  var startDate = ee.String(year).cat("-").cat(monthString).cat("-01");
  var endDate = ee.Date(startDate).advance(1, "month");

  return firmsData
    .filterDate(startDate, endDate)
    .filterBounds(aoi)
    .select("T21")
    .max()
    .clip(aoi);
};

var firesVis = {
  min: 325.0,
  max: 400.0,
  palette: ["red", "orange", "yellow"],
};

exports.getMonthlyComposite = getMonthlyComposite;
exports.firesVis = firesVis;
