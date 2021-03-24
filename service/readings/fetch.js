"use strict";

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

const now = new Date().valueOf();
const DAY = 24 * 3600 * 1000;

module.exports.getReadings = async (event, context, callback) => {
  try {
    const readings = await getData(event);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/csv",
      },
      body: readings,
    };

    callback(null, response);
  } catch (error) {
    console.error(error);

    callback(null, {
      statusCode: error.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't fetch the readings.",
    });
    return;
  }
};

const getData = ({ queryStringParameters: query }) => {
  console.log("getData", query);

  const fromParam = query && query.from ? parseInt(query.from) : now - 5 * DAY;
  const toParam = query && query.to ? parseInt(query.to) : now;

  var params = {
    Statement: `SELECT * FROM ${process.env.DYNAMODB_FETCH_INDEX} WHERE "partition" = 'default' AND "timestamp" >= ${fromParam} AND "timestamp" <= ${toParam}`,
  };

  return new Promise((resolve, reject) => {
    dynamoDb.executeStatement(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        reject(err);
      } else {
        console.log("Query succeeded.");

        let csv = "timestamp,source,reading\n";
        data.Items.forEach(function (item) {
          csv += `${item.timestamp.N},${item.source.S},${item.reading.N}\n`;
        });

        resolve(csv);
      }
    });
  });
};
