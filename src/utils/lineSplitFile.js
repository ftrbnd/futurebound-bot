import { promises } from 'fs';

export const lineSplitFile = async (filename) => {
  try {
    const contents = await promises.readFile(filename, 'utf-8');
    const arr = contents.split(/\r?\n/);

    return arr;
  } catch (err) {
    console.error(err);
  }
};
