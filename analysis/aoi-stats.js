// ============================================
// aoi-stats.js
// Annual, Monthly & Seasonal statistics for AOI comparison
// Amazon Region compare to Tapajós Basin
// ============================================

var hchoProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-hcho");
var no2Processor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel5p-no2");
var firmsProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/firms");
var ndviProcessor = require("users/rcrdbchmnn/hcho-investigation:data-processing/sentinel2-ndvi");
var YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
var MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// === ANNUAL HCHO - AOIs CHART (2019-2025)

var buildAnnualChart = function (geometryAmazon, geometryTapajos) {
  var amazonHchoValues = [];
  var tapajosHchoValues = [];

  YEARS.forEach(function (year) {
    var amazonHcho = hchoProcessor.getYearlyComposite(year, geometryAmazon);
    var tapajosHcho = hchoProcessor.getYearlyComposite(year, geometryTapajos);

    var hchoMeanAmazon = amazonHcho.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 5000,
      maxPixels: 1e9,
    });

    var hchoMeanTapajos = tapajosHcho.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    amazonHchoValues.push(
      ee
        .Number(hchoMeanAmazon.get("tropospheric_HCHO_column_number_density"))
        .multiply(1e6),
    ); // .multiply(1e6) to display data values in Chart Tooltip
    tapajosHchoValues.push(
      ee
        .Number(hchoMeanTapajos.get("tropospheric_HCHO_column_number_density"))
        .multiply(1e6),
    );

    //print("---"  + year + "---");
    //print("   HCHO AMAZON-REGION:", hchoMeanAmazon.get("tropospheric_HCHO_column_number_density"));
    //print("   HCHO TAPAJOS-BASIN:", hchoMeanTapajos.get("tropospheric_HCHO_column_number_density"));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([amazonHchoValues, tapajosHchoValues]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Annual 2019-2025 HCHO Concentration for Areas of Interest",
      hAxis: { title: "Year" },
      vAxis: { title: "HCHO (mol/m²)" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// === Monthly HCHO - AOIs CHART (2024)

var buildMonthlyChart = function (geometryAmazon, geometryTapajos) {
  var amazonHchoValues = [];
  var tapajosHchoValues = [];

  MONTHS.forEach(function (month) {
    var amazonHcho = hchoProcessor.getMonthlyComposite(
      "2024",
      month,
      geometryAmazon,
    );
    var tapajosHcho = hchoProcessor.getMonthlyComposite(
      "2024",
      month,
      geometryTapajos,
    );

    var hchoMeanAmazon = amazonHcho.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 5000,
      maxPixels: 1e9,
    });

    var hchoMeanTapajos = tapajosHcho.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    amazonHchoValues.push(
      ee
        .Number(hchoMeanAmazon.get("tropospheric_HCHO_column_number_density"))
        .multiply(1e6),
    );
    tapajosHchoValues.push(
      ee
        .Number(hchoMeanTapajos.get("tropospheric_HCHO_column_number_density"))
        .multiply(1e6),
    );

    //print("---"  + month + "---");
    //print("   HCHO AMAZON-REGION:", hchoMeanAmazon.get("tropospheric_HCHO_column_number_density"));
    //print("   HCHO TAPAJOS-BASIN:", hchoMeanTapajos.get("tropospheric_HCHO_column_number_density"));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([amazonHchoValues, tapajosHchoValues]),
      axis: 1,
      xLabels: MONTHS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Monthly 2024 HCHO Concentration for Areas of Interest",
      hAxis: { title: "Months" },
      vAxis: { title: "HCHO (mol/m²)" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// Yearly September HCHO - Tapajos Basin Chart (2019-2025)

var buildYearlySeptemberHchoChart = function (geometryTapajos) {
  var tapajosSeptemberValues = [];

  YEARS.forEach(function (year) {
    var hchoSeptemberTapajos = hchoProcessor.getMonthlyComposite(
      year,
      9,
      geometryTapajos,
    );

    var hchoSeptemberMean = hchoSeptemberTapajos.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });
    tapajosSeptemberValues.push(
      ee
        .Number(
          hchoSeptemberMean.get("tropospheric_HCHO_column_number_density"),
        )
        .multiply(1e6), // .multiply(1e6) to display data values in Chart Tooltip
    );

    //print('---' + year + '---');
    //print("HCHO TAPAJOS SEPTEMBER:", hchoSeptemberMean.get('tropospheric_HCHO_column_number_density'));
  });

  // Upper and Lowe Basline functionality
  var baselineSepValues = tapajosSeptemberValues.slice(0, 5); // 2019-2023
  var baselineArr = ee.Array(baselineSepValues); // .reducer() works only of GEE-Objects not for javascript

  var meanResult = baselineArr.reduce(ee.Reducer.mean(), [0]);
  var stdDevResult = baselineArr.reduce(ee.Reducer.stdDev(), [0]);
  var meanScalar = meanResult.get([0]);
  var stdDevScalar = stdDevResult.get([0]);

  var lowerBand = meanScalar.subtract(stdDevScalar);
  var upperBand = meanScalar.add(stdDevScalar);

  var minBaseline = ee.List.repeat(lowerBand, 7);
  var maxBaseline = ee.List.repeat(upperBand, 7);

  var chart = ui.Chart.array
    .values({
      array: ee.Array([tapajosSeptemberValues, maxBaseline, minBaseline]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames([
      "Tapajos-Basin",
      "Upper Baseline (2019-2023)",
      "Lower Baseline(2019-2023)",
    ])
    .setOptions({
      title: "Yearly September HCHO Concentration for Areas of Interest",
      hAxis: { title: "Years" },
      vAxis: { title: "HCHO (mol/m²)" },
      lineWidth: 2,
      colors: ["1d6b99", "e37d05", "e37d05"],
      series: {
        0: {},
        1: { lineDashStyle: [4, 4], pointSize: 0 },
        2: { lineDashStyle: [4, 4], pointSize: 0 },
      },
    });

  print(chart);
};

// === ANNUAL N02 - AOIs CHART (2019-2025)

var buildAnnualNo2Chart = function (geometryAmazon, geometryTapajos) {
  var amazonNo2Values = [];
  var tapajosNo2Values = [];

  YEARS.forEach(function (year) {
    var no2Amazon = no2Processor.getYearlyComposite(year, geometryAmazon);
    var no2Tapajos = no2Processor.getYearlyComposite(year, geometryTapajos);

    var no2AmazonMean = no2Amazon.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 5000,
      maxPixels: 1e9,
    });

    var no2TapajosMean = no2Tapajos.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    amazonNo2Values.push(
      ee
        .Number(no2AmazonMean.get("tropospheric_NO2_column_number_density"))
        .multiply(1e6),
    );
    tapajosNo2Values.push(
      ee
        .Number(no2TapajosMean.get("tropospheric_NO2_column_number_density"))
        .multiply(1e6),
    );

    //print("---" + year + "---");
    //print("NO2 AMAZON-REGION:", no2AmazonMean.get('tropospheric_NO2_column_number_density'));
    //print("NO2 TAPAJOS-BASIN:", no2TapajosMean.get('tropospheric_NO2_column_number_density'));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([amazonNo2Values, tapajosNo2Values]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Annual 2019-2025 NO2 Concentration for Areas of Interest",
      hAxis: { title: "Years" },
      vAxis: { title: "NO2 column number density mol/m²" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// === MONTHLY N02 - AOIs CHART (2024)

var buildMonthlyNo2Chart = function (geometryAmazon, geometryTapajos) {
  var no2AmazonValues = [];
  var no2TapajosValues = [];

  MONTHS.forEach(function (month) {
    var no2Amazon = no2Processor.getMonthlyComposite(
      "2024",
      month,
      geometryAmazon,
    );
    var no2Tapajos = no2Processor.getMonthlyComposite(
      "2024",
      month,
      geometryTapajos,
    );

    var no2AmazonMean = no2Amazon.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 5000,
      maxPixels: 1e9,
    });

    var no2TapajosMean = no2Tapajos.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    no2AmazonValues.push(
      ee
        .Number(no2AmazonMean.get("tropospheric_NO2_column_number_density"))
        .multiply(1e6),
    );
    no2TapajosValues.push(
      ee
        .Number(no2TapajosMean.get("tropospheric_NO2_column_number_density"))
        .multiply(1e6),
    );

    //print("---" + month + "---");
    //print("NO2 CONCENTRATION 2024 AMAZON-REGION:", no2AmazonMean.get('tropospheric_NO2_column_number_density'));
    //print("NO2 CONCENTRATION 2024 TAPAJOS-REGION:", no2TapajosMean.get('tropospheric_NO2_column_number_density'));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([no2AmazonValues, no2TapajosValues]),
      axis: 1,
      xLabels: MONTHS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Monthly 2024 NO2 Concentration for Areas of Interest",
      hAxis: { title: "Months" },
      vAxis: { title: "NO2 column number density mol/m²" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// Yearly September NO2 - Tapajos Basin Chart (2019-2025)

var buildYearlySeptemberNo2Chart = function (geometryTapajos) {
  var tapajosSeptemberValues = [];

  YEARS.forEach(function (year) {
    var no2SeptemberTapajos = no2Processor.getMonthlyComposite(
      year,
      9,
      geometryTapajos,
    );

    var no2SeptemberMean = no2SeptemberTapajos.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    tapajosSeptemberValues.push(
      ee
        .Number(no2SeptemberMean.get("tropospheric_NO2_column_number_density"))
        .multiply(1e6),
    );

    //print('---' + year + '---');
    //print('NO2 TAPAJOS SEPTEMBER:', no2SeptemberMean.get('tropospheric_NO2_column_number_density'));
  });

  // Upper Lower Basline functionality

  var baselineSepValues = tapajosSeptemberValues.slice(0, 5); // 2019-2023
  var baselineArr = ee.Array(baselineSepValues); //

  var meanResult = baselineArr.reduce(ee.Reducer.mean(), [0]); // Average of 5 NO2 values (2019-2023), [0] = reduce along axis 0: collapse all 5 values into one (mean/ stdDev)
  var stdDevResult = baselineArr.reduce(ee.Reducer.stdDev(), [0]); // Standard Deviation: Measures how widely the 5 values are spread around the mean

  var meanScalar = meanResult.get([0]); // .get the value at position 0 to use it for calculations: from arr to number (ee.Array([0.0000182]) ->  0.0000182)
  var stdDevScalar = stdDevResult.get([0]);

  var lowerBand = meanScalar.subtract(stdDevScalar); // meanScalar - stdDevScalar = lower limit of the mean range
  var upperBand = meanScalar.add(stdDevScalar); // meanScalar + stdDevScalar = upper limit of the mean range

  var minBaseline = ee.List.repeat(lowerBand, 7); // Set the lower dotted mean line for Chart (2019-2025)
  var maxBaseline = ee.List.repeat(upperBand, 7); // Set the upper dotted mean line for Chart (2019-2025)

  var chart = ui.Chart.array
    .values({
      array: ee.Array([tapajosSeptemberValues, maxBaseline, minBaseline]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames([
      "Tapajos-Basin",
      "Upper Baseline (2019-2023)",
      "Lower Baseline (2019-2023)",
    ])
    .setOptions({
      title: "Yearly September NO2 Concentration for Areas of Interest",
      hAxis: { title: "Years" },
      vAxis: { title: "NO2 column number density µmol/m²" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
      series: {
        0: {},
        1: { lineDashStyle: [4, 4], pointSize: 0 },
        2: { lineDashStyle: [4, 4], pointSize: 0 },
      },
    });

  print(chart);
};

// === ANNUAL FIRMS FIRE - AOIs CHART (2019-2025)

var buildAnnualFirmsChart = function (geometryAmazon, geometryTapajos) {
  var amazonFirmsValues = [];
  var tapajosFirmsValues = [];

  YEARS.forEach(function (year) {
    var amazonFirms = firmsProcessor.getYearlyComposite(year, geometryAmazon);
    var tapajosFirms = firmsProcessor.getYearlyComposite(year, geometryTapajos);

    var amazonFirmsMean = amazonFirms.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 1000,
      maxPixels: 1e9,
    });

    var tapajosFirmsMean = tapajosFirms.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 1000,
      maxPixels: 1e9,
    });

    amazonFirmsValues.push(amazonFirmsMean.get("T21"));
    tapajosFirmsValues.push(tapajosFirmsMean.get("T21"));

    //print("---"  + year + "---");
    //print("   FIRE CONCENTRATION AMAZON-REGION:", amazonFirmsMean.get("T21"));
    //print("   FIRE CONCENTRATION TAPAJOS-BASIN:", tapajosFirmsMean.get("T21"));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([amazonFirmsValues, tapajosFirmsValues]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Annual 2019-2025 FIRE Concentration for Areas of Interest",
      hAxis: { title: "Years" },
      vAxis: { title: "T21 Brightness Temperature (K)" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// === MONTHLY FIRMS FIRE CHART 2024

var buildMonthlyFirmsChart = function (geometryAmazon, geometryTapajos) {
  var amazonFirmsValues = [];
  var tapajosFirmsValues = [];

  MONTHS.forEach(function (month) {
    var amazonFirms = firmsProcessor.getMonthlyComposite(
      "2024",
      month,
      geometryAmazon,
    );
    var tapajosFirms = firmsProcessor.getMonthlyComposite(
      "2024",
      month,
      geometryTapajos,
    );

    var amazonFirmsMean = amazonFirms.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryAmazon,
      scale: 1000,
      maxPixels: 1e9,
    });

    var tapajosFirmsMean = tapajosFirms.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 1000,
      maxPixels: 1e9,
    });

    amazonFirmsValues.push(amazonFirmsMean.get("T21"));
    tapajosFirmsValues.push(tapajosFirmsMean.get("T21"));

    //print("---" + month + "---");
    //print("FIRE CONCENTRATION (10.24) AMAZON-REGION:", amazonFirmsMean.get("T21"));
    //print("FIRE CONCENTRATION (10.24) TAPAJOS-REGION:", tapajosFirmsMean.get("T21"));
  });

  var chart = ui.Chart.array
    .values({
      array: ee.Array([amazonFirmsValues, tapajosFirmsValues]),
      axis: 1,
      xLabels: MONTHS,
    })
    .setSeriesNames(["Amazon", "Tapajos-Basin"])
    .setOptions({
      title: "Monthly 2024 FIRE Concentration for Areas of Interest",
      hAxis: { title: "Months" },
      vAxis: { title: "T21 Brightness Temperature (K)" },
      lineWidth: 2,
      colors: ["e37d05", "1d6b99"],
    });

  print(chart);
};

// Yearly September NDVI - Tapajos Basin Chart (2019-2025)

var buildYearlySeptemberNdviChart = function (geometryTapajos) {
  var ndviTapajosValues = [];

  YEARS.forEach(function (year) {
    var ndviTapajos = ndviProcessor.getMonthlyComposite(
      year,
      9,
      geometryTapajos,
    );

    var tapajosNdviMean = ndviTapajos.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 1000,
      maxPixels: 1e9,
    });

    ndviTapajosValues.push(tapajosNdviMean.get("nd"));

    print("---" + year + "---");
    print("NDVI TAPAJOS REGION", tapajosNdviMean.get("nd"));
  });

  // Upper Lower Baseline functionality

  var baselineSepValues = ndviTapajosValues.slice(0, 5); // 2019-2023
  var baselineArr = ee.Array(baselineSepValues); // .reducer() works only for GEE-Objects.. NO javascript
  var meanResult = baselineArr.reduce(ee.Reducer.mean(), [0]);
  var stdDevResult = baselineArr.reduce(ee.Reducer.stdDev(), [0]);
  var meanScalar = meanResult.get([0]);
  var stdDevScalar = stdDevResult.get([0]);

  var lowerBand = meanScalar.subtract(stdDevScalar);
  var upperBand = meanScalar.add(stdDevScalar);

  var minBaseline = ee.List.repeat(lowerBand, 7);
  var maxBaseline = ee.List.repeat(upperBand, 7);

  var chart = ui.Chart.array
    .values({
      array: ee.Array([ndviTapajosValues, maxBaseline, minBaseline]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames([
      "Tapajos-Basin",
      "Upper Baseline (2019-2023)",
      "Lower Baseline (2019-2023)",
    ])
    .setOptions({
      title: "Yearly September NDVI Dimension 2019-2025 for Tapajos-Basin",
      hAxis: { title: "Years" },
      vAxis: { title: "NDVI" },
      lineWidth: 2,
      colors: ["e37d05", "e37d05", "e37d05"],
      series: {
        0: {},
        1: { lineDashStyle: [4, 4], pointSize: 0 },
        2: { lineDashStyle: [4, 4], pointSize: 0 },
      },
    });

  print(chart);
};

// Yearly September HCHO/NO2 RATIOCHART - Tapajos Basin Chart (2019-2025)

var buildYearlySeptemberRatioChart = function (geometryTapajos, no2Threshold) {
  var ratioValues = [];

  YEARS.forEach(function (year) {
    var hchoTapajos = hchoProcessor.getMonthlyComposite(
      year,
      9,
      geometryTapajos,
    );
    var no2Tapajos = no2Processor.getMonthlyComposite(year, 9, geometryTapajos);

    var no2Masked = no2Tapajos.updateMask(no2Tapajos.gt(no2Threshold));
    var no2Ratio = hchoTapajos.divide(no2Masked);

    var ratioMean = no2Ratio.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometryTapajos,
      scale: 5000,
      maxPixels: 1e9,
    });

    ratioValues.push(ratioMean.get("tropospheric_HCHO_column_number_density"));
    print("---" + year + "---");
    print(
      "RATIO TAPAJOS REGION",
      ratioMean.get("tropospheric_HCHO_column_number_density"),
    );
  });

  // Upper lower Baseline functionality
  var baselineSepValues = ratioValues.slice(0, 5);
  var baselineArr = ee.Array(baselineSepValues);

  var meanResult = baselineArr.reduce(ee.Reducer.mean(), [0]);
  var stdDevResult = baselineArr.reduce(ee.Reducer.stdDev(), [0]);

  var meanScalar = meanResult.get([0]);
  var stdDevScalar = stdDevResult.get([0]);

  var lowerBand = meanScalar.subtract(stdDevScalar);
  var upperBand = meanScalar.add(stdDevScalar);

  var minBaseline = ee.List.repeat(lowerBand, 7);
  var maxBaseline = ee.List.repeat(upperBand, 7);

  var chart = ui.Chart.array
    .values({
      array: ee.Array([ratioValues, maxBaseline, minBaseline]),
      axis: 1,
      xLabels: YEARS,
    })
    .setSeriesNames([
      "HCHO/NO2-Ratio",
      "Upper Baseline (2019-2023)",
      "Lower Baseline (2019-2023)",
    ])
    .setOptions({
      title: "Yearly September HCHO/NO2 Ratio 2019-2025 for Tapajos-Basin",
      hAxis: { title: "Years" },
      vAxis: { title: "Ratio" },
      lineWidth: 2,
      colors: ["0000ff", "e37d05", "e37d05"],
      series: {
        0: {},
        1: { lineDashStyle: [4, 4], pointSize: 0 },
        2: { lineDashStyle: [4, 4], pointSize: 0 },
      },
    });

  print(chart);
};

// === EXPORTS
exports.YEARS = YEARS;
exports.MONTHS = MONTHS;

exports.buildAnnualChart = buildAnnualChart;
exports.buildMonthlyChart = buildMonthlyChart;
exports.buildYearlySeptemberHchoChart = buildYearlySeptemberHchoChart;

exports.buildAnnualFirmsChart = buildAnnualFirmsChart;
exports.buildMonthlyFirmsChart = buildMonthlyFirmsChart;

exports.buildAnnualNo2Chart = buildAnnualNo2Chart;
exports.buildMonthlyNo2Chart = buildMonthlyNo2Chart;
exports.buildYearlySeptemberNo2Chart = buildYearlySeptemberNo2Chart;

exports.buildYearlySeptemberNdviChart = buildYearlySeptemberNdviChart;
exports.buildYearlySeptemberRatioChart = buildYearlySeptemberRatioChart;
