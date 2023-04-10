import FixContext from './fix-context/fix-context.js';
import Logger from './logger/logger.js';
import ViewError from './shared/view-error.js';

Logger.setDom(document.querySelector('div.logs'));

const initText = [
	`date: 2022-11-04`,
	`zone: UTC`,
	`height: 50 ft`,
	``,
	`Canopus, 14:49:23, 21°36.4'`,
	`Rigel, 14:50:32, 32°21.2'`,
	`Sirius, 14:52:05, 13°20.2'`,
].join('\n');

const inputBox = document.querySelector('textarea');
inputBox.value = initText;

const run = () => {
	Logger.clear();
	Logger.log('Computing fix...');
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
			Logger.log('\nError: ' + err.message);
			Logger.log(`Error occurred when computing this line: "${line}"`);
			return;
		}
	}
};

inputBox.addEventListener('input', run);
run();
