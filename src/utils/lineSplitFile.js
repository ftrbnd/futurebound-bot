const fs = require('fs');

const lineSplitFile = async (filename) => {
  try {
    const contents = await fs.promises.readFile(filename, 'utf-8');
    const arr = contents.split(/\r?\n/);

    return arr;
  } catch (err) {
    console.error(err);
  }
};

module.exports = lineSplitFile;
