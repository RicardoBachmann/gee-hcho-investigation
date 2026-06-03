//Accessing RADD forest disturbance alert

var radd = ee.ImageCollection("projects/radar-wur/raddalert/v1");
var geography = "sa"; // south america

// No collection.filterDate(startDate, endDate).mean() workaround as before for HCHO, N02, NDVI, FIRMS..
// RADD is a single Image only with two band, no own timestamps, no timestamps to filter
// RADD = filter through pixel values alert_date bands.
// (year, month) -> yyDOY-Range
// ("2024", 9, aoi) -> 24245 - 22427
var getMonthlyComposite = function (year, month, aoi) {
  var monthString = ee.Number(month).format("%02d");
  var startDate = ee.String(year).cat("-").cat(monthString).cat("-01");
  var endDate = ee.Date(startDate).advance(1, "month");

  // RADD date functionality count in days (Day of Year)
  // .getRelative() is 0-indexed - so return first day of the year as 0, not 1
  // IMPORTANT 2024 = LEAP YEAR!
  var startDOY = ee.Date(startDate).getRelative("day", "year").add(1); // Day 245
  var endDOY = endDate.getRelative("day", "year"); // Day 274

  // Converts the 4-digit year into a 2-digit number
  // .parse() from sting ("2024")into a number (2024)
  var yearShort = ee.Number.parse(year).subtract(2000); // "2024" -> 2024 -> 24
  //
  var startCode = yearShort.multiply(1000).add(startDOY); // 24*1000+245 = 24245
  var endCode = yearShort.multiply(1000).add(endDOY); // 24*1000+274 = 24274

  var raddImage = radd
    .filterMetadata("layer", "contains", "alert")
    .filterMetadata("geography", "equals", geography)
    .sort("system:time_end", false)
    .first();

  var alertDate = raddImage.select("Date");
  var alert = raddImage.select("Alert");

  var mask = alertDate
    .gte(startCode)
    .and(alertDate.lte(endCode))
    .and(alert.eq(3));

  return raddImage.select("Date").updateMask(mask).clip(aoi);
};

var raddVis = {
  min: 24245,
  max: 24274,
  palette: ["yellow", "orange", "red"],
};

exports.getMonthlyComposite = getMonthlyComposite;
exports.raddVis = raddVis;
