import Degrees from './es6lib/degrees.js';
import FixContext from './fix-context/fix-context.js';
import Logger from './logger/logger.js';
import PlottingSheet from './plotting-sheet/plotting-sheet.js';
import ViewError from './shared/view-error.js';

Logger.setDom(document.querySelector('div.logs'));
const sheet = new PlottingSheet(document.querySelector('#sheet canvas'));
const deg = Degrees.arcMins();
const initText = [
	`date: Nov 15th, 2018`,
	`dr: 29°42.2', -37°2.5'`,
	`zone: UTC`,
	`index: -0.3'`,
	`height: 2 m`,
	``,
	`dubhe, 08:32:15, 55° 18.4'`,
	`arcturus, 08:30:30, 27° 9'`,
	`regulus, 08:28:15, 70° 48.7'`,
].join('\n');

const inputBox = document.querySelector('textarea');
inputBox.value = initText;

const stringifyCoord = ([ lat, lon ]) => {
	lat = deg.stringify(lat, [ 'N ', 'S ' ]);
	lon = deg.stringify(lon, [ 'E ', 'W ' ]);
	return lat + ', ' + lon;
};

const run = () => {
	Logger.clear();
	Logger.log('Computing fix...');
	sheet.clear();
	sheet.run();
	const ctx = new FixContext();
	const lines = inputBox.value.trim().split(/\s*\n\s*/);
	for (const line of lines) {
		try {
			ctx.computeLine(line);
		} catch (err) {
			if (!(err instanceof ViewError)) {
				Logger.log('\nInternal Error: ' + err.message);
				console.error(err);
				return;
			}
			Logger.error('\nError: ' + err.message);
			Logger.error(`At: "${line}"`);
			return;
		}
	}
	if (ctx.dr) {
		sheet.dr = ctx.dr;
		sheet.circles = ctx.circles;
		const res = sheet.run();
		if (res != null) {
			Logger.log(`\nPlotting sheet result: ${stringifyCoord(res)}`);
		}
	}
};

inputBox.addEventListener('input', run);
run();
