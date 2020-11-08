import spicy from 'spicymkdir';
import path from 'path';
import { getFiles, getImage } from './util/fetcher';
const chalk = require('chalk');
const fs = require('fs');
const camelCase = require('camelcase');

export default function () {
  console.log('version ' + version);
}

async function getNodes() {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await getFiles().then((e) => {
        return e;
      });

      if (data.nodes['0:1'].document.type !== 'CANVAS' || !data) {
        reject('Unable to fetch content');
      }

      const IconCanvas = await data.nodes['0:1'].document;

      // remove non FRAME nodes
      const content = IconCanvas.children.filter((el) => {
        return el.type === 'FRAME';
      });

      if (!content) {
        reject('Unable to fetch content');
      }
      resolve(content);
    } catch (e) {
      reject(e);
    }
  });
}

function mapNodes() {
  return new Promise((resolve, reject) => {
    try {
      getNodes().then((frame) => {
        console.log(
          `${chalk.green.bold(`Success`)}: Fetched ${frame.length} frames\n`
        );
        let sum = 0;
        const icons = frame.map((node) => {
          sum += node.children.length;
          console.log(
            `${chalk.bold(node.name)} - ${node.children.length} icons`
          );
          const meta = node.children.map((el) => {
            return {
              id: el.id,
              name: camelCase(el.name.split('/')[1].trim()),
            };
          });
          return {
            category: node.name,
            icons: [...meta],
          };
        });
        console.log(` ------- \n  Total icons: ${sum}`);
        if (!icons) reject(`Unable to process icons name or id`);

        resolve(icons);

        const outputDir = 'figma';

        // this should be taken care of better to avoid version clashing with figma
        spicy.mkdirSync(outputDir);
        fs.writeFile(
          path.join(outputDir, `/icons.json`),
          JSON.stringify(icons),
          (err) => {
            if (err) {
              console.error(err);
            }
          }
        );
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function getSVG() {
  // array of nodes
  const nodes = await mapNodes().then((nodes) =>
    nodes.map((frame) => {
      return frame;
    })
  );
  console.log(nodes);
}

getSVG();
