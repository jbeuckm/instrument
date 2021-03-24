"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

module.exports.save = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const items = JSON.parse(event.body);

  var params = {
    RequestItems: {
      [process.env.DYNAMODB_TABLE]: Object.keys(items).map((source) => ({
        PutRequest: {
          Item: {
            partition: { S: "default" },
            timestamp: { N: "" + timestamp },
            source: { S: source },
            reading: { N: "" + items[source] },
          },
        },
      })),
    },
  };

  ddb.batchWriteItem(params, function (error, data) {
    if (error) {
      console.error(error);

      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't create the readings.",
      });
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };

    callback(null, response);
  });
};
