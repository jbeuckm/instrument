const data = require("./data.json");
const fs = require("fs");
const { exec } = require("child_process");

function generateBatch(start = 0) {
  const requests = {
    readings: data.Items.slice(start, start + 25).map((item) => ({
      PutRequest: {
        Item: { ...item, partition: { S: "default" } },
      },
    })),
  };

  fs.writeFileSync("batch.json", JSON.stringify(requests, null, 2));

  return new Promise((resolve, reject) => {
    exec(
      "aws --region us-east-2 dynamodb batch-write-item --request-items file://batch.json",
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return reject(error);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        setTimeout(resolve, 11000);
      }
    );
  });
}

const transferBatches = async () => {
  let start = 30700;
  while (start < data.Items.length) {
    console.log({ start });
    try {
      await generateBatch(start);
      start += 25;
    } catch (error) {
      console.log(error);
      await new Promise((resolve, reject) => setTimeout(resolve, 30000));
    }
  }
};

transferBatches();
