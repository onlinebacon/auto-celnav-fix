const stringifyArcMins = (value, [ pos, neg ]) => {
	const totalArcMins = Math.round(Math.abs(value)*600)/10;
	const arcMinsVal = totalArcMins % 60;
	const degrees = Math.round((totalArcMins - arcMinsVal)/60);
	const prefix = (value < 0) && (totalArcMins !== 0) ? neg : pos;
	if (arcMinsVal === 0) {
		return prefix + degrees + '°';
	}
	if (degrees === 0) {
		return prefix + Number(arcMinsVal.toFixed(1)) + "'";
	}
	return prefix + degrees + '°'
		+ (Number(arcMinsVal.toFixed(1)) + "'").replace(/^(\d)\b/, '0$1');
};

class DegreesConverter {
	constructor(stringifyFn = stringifyArcMins) {
		this.stringifyFn = stringifyFn;
	}
	parse(string) {
		string = string.trim();
		const prefix = string.match(/^[-+]/)?.[0];
		if (prefix) {
			string = string.substring(1).trim();
		}
		if (string === '') {
			return NaN;
		}
		let sum = 0;
		let unit = 1;
		while (string !== '') {
			const strnum = string.match(/^\d+(\.\d+)?/)?.[0];
			if (strnum === undefined) {
				break;
			}
			const val = Number(strnum);
			string = string.substring(strnum.length);
			const sep = string.match(/^(\s|\s*[°'"]\s*)/)?.[0];
			if (sep !== undefined) {
				string = string.substring(sep.length);
				switch (sep.trim()) {
					case '°': unit = 1; break;
					case "'": unit = 1/60; break;
					case '"': unit = 1/3600; break;
				}
			}
			sum += val*unit;
			if (sep === undefined) {
				break;
			}
			unit /= 60;
		}
		if (string !== '') {
			return NaN;
		}
		if (prefix === '-') {
			return - sum;
		}
		return sum;
	}
	stringify(value, prefix = [ '', '-' ]) {
		return this.stringifyFn(value, prefix);
	}
	arcMins() {
		return new DegreesConverter();
	}
}

const Degrees = new DegreesConverter();
export default Degrees;
