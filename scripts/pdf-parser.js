const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = process.argv[2];

if (!filePath) {
  console.error(JSON.stringify({ error: 'No file path provided' }));
  process.exit(1);
}

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer)
  .then(function (data) {
    console.log(JSON.stringify({ 
      text: data.text,
      numPages: data.numpages,
      info: data.info
    }));
  })
  .catch(function (error) {
    console.error(JSON.stringify({ error: 'Failed to parse PDF', details: error.message }));
    process.exit(1);
  });
