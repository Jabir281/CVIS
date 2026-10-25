import { readFile } from 'node:fs/promises';
import { parseGoal, parseSite } from '../lib/content/schema.ts';

const read = async (name) => JSON.parse(await readFile(new URL(`../content/${name}.json`, import.meta.url), 'utf8'));
parseSite(await read('site'));
parseGoal(await read('goal'));
console.log('PASS: preview content validates; editorial approval is still pending.');
