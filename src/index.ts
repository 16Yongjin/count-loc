#!/usr/bin/env node
import { program } from 'commander';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { table } from 'table';
import { resolve } from 'path';

const countLines = async (file: string): Promise<number> => {
  const content = await readFile(file, 'utf-8');
  const lines = content.split('\n');
  return lines.length;
};

type LOCHistogram = {
  /** loc histogram by 100 lines */
  [extension: string]: number[];
};

const main = async () => {
  program
    .argument('[exts]', 'ex) jsx,tsx,vue')
    .argument('[root dir]', 'ex) ./components')
    .parse();

  const [exts = 'js,ts,jsx,tsx,vue', rootDir = '.'] = program.args;
  const extensions = exts.split(',');

  const histogram: LOCHistogram = Object.fromEntries(
    extensions.map((ext) => [ext, Array(11).fill(0)])
  );

  console.log('[Lines of Code per Extensions]');
  console.log('Directory  :', resolve(rootDir));
  console.log('Extensions :', extensions.join(', '));
  console.log();

  for (const extension of extensions) {
    const files = await glob(`${rootDir}/**/*.${extension}`, {
      ignore: 'node_modules/**/*',
    });

    for (const file of files) {
      const lines = await countLines(file);
      const index = Math.min(Math.floor(lines / 100), 10);
      histogram[extension][index]++;
    }
  }

  const data = [
    [
      'Ext.',
      '~100',
      '~200',
      '~300',
      '~400',
      '~500',
      '~600',
      '~700',
      '~800',
      '~900',
      '~1000',
      '1000~',
      'total',
    ],

    ...Object.entries(histogram)
      .filter(([_, counts]) => counts.some((count) => count > 0))
      .map(([extension, counts]) => [
        extension,
        ...counts,
        counts.reduce((acc, cur) => acc + cur, 0),
      ]),
  ];

  console.log(table(data));
};

main();
