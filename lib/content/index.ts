import rawSite from '../../content/site.json';
import rawGoal from '../../content/goal.json';
import { parseGoal, parseSite } from './schema';

export const site = parseSite(rawSite);
export const goal = parseGoal(rawGoal);
