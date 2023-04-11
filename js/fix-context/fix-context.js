import Almanac from '../es6lib/almanac.js';
import { calcAltRefraction } from '../es6lib/celnav.js';
import { calcAriesGHA, calcDip } from '../es6lib/celnav.js';
import { calcAzm } from '../es6lib/coord.js';
import Degrees from '../es6lib/degrees.js';
import LengthUnits from '../es6lib/length-units.js';
import Trig from '../es6lib/trig.js';
import Logger from '../logger/logger.js';
import ViewError from '../shared/view-error.js';
import parseDate from './parse-date.js';
import parseZone from './parse-zone.js';

const lengthUnits = new LengthUnits().use('m');
const Regex = {
	heightField: /^height:\s*/i,
	indexField:  /^index:\s*/i,
	dateField:   /^date:\s*/i,
	zoneField:   /^zone:\s*/i,
	timeField:   /^time:\s*/i,
	drField:     /^dr:\s*/i,
};

let degrees = Degrees;

export default class FixContext {
	constructor() {
		this.dip = null;
		this.index = null;
		this.date = null;
		this.zone = null;
		this.time = null;
		this.body = null;
		this.alt = null;
		this.circles = [];
	}
	computeLine(line) {
		if (Regex.heightField.test(line)) return this.computeHeightLine(line);
		if (Regex.indexField.test(line)) return this.computeIndexLine(line);
		if (Regex.dateField.test(line)) return this.computeDateLine(line);
		if (Regex.zoneField.test(line)) return this.computeZoneLine(line);
		if (Regex.drField.test(line)) return this.computeDrLine(line);
		if (/,.*,/.test(line)) return this.computeReading(line);
		throw new ViewError(`Unable to compute input line`);
	}
	computeReading(line) {
		const [ body, time, reading ] = line.split(/\s*,\s*/);
		this.updateTime(time);
		this.updateBody(body);
		this.updateAlt(reading);
		this.buildCircle();
	}
	computeHeightLine(line) {
		const value = line.replace(Regex.heightField, '').trim();
		const height = lengthUnits.parse(value);
		if (isNaN(height)) {
			throw new ViewError(`Invalid format for height "${value}"`);
		}
		const dip = calcDip(height);
		this.dip = dip;
		Logger.log(`Dip = ${degrees.stringify(dip)}`);
	}
	computeIndexLine(line) {
		const value = line.replace(Regex.indexField, '').trim();
		const parsed = degrees.parse(value);
		if (isNaN(parsed)) {
			throw new ViewError(`Invalid format for index error "${value}"`);
		}
		if (parsed === 0) {
			return;
		}
		this.index = parsed;
		Logger.log(`Index error = ${degrees.stringify(parsed, ['+', '-'])}`);
	}
	computeDateLine(line) {
		const value = line.replace(Regex.dateField, '').trim();
		const parsed = parseDate(value);
		if (parsed == null) {
			throw new ViewError(`Invalid date "${value}"`);
		}
		this.date = parsed;
	}
	computeZoneLine(line) {
		const value = line.replace(Regex.zoneField, '').trim();
		const parsed = parseZone(value);
		if (parsed == null) {
			throw new ViewError(`Invalid time zone "${value}"`);
		}
		this.zone = parsed;
	}
	computeDrLine(line) {
		const value = line.replace(Regex.drField, '').trim();
		const dr = value.split(/\s*,\s*/).map(val => Degrees.parse(val));
		const [ lat, lon ] = dr;
		if (dr.length !== 2 || isNaN(lat) || isNaN(lon)) {
			throw new ViewError(`Invalid dead reckoning "${value}"`);
		}
		this.dr = dr;
	}
	updateTime(time) {
		if (this.zone === null) {
			this.zone = '+0000';
		}
		if (this.date === null) {
			throw new ViewError(`Missing date`);
		}
		const iso = this.date + 'T' + time + this.zone;
		this.time = new Date(iso);
	}
	updateAlt(alt) {
		let angle = degrees.parse(alt);
		if (isNaN(angle)) {
			throw new ViewError(`Invalid format for sextant altitude ${alt}`);
		}
		this.alt = angle;
	}
	updateBody(body) {
		const unixTime = this.getUnixTime();
		const star = Almanac.getStar(body, unixTime);
		if (!star) {
			throw new ViewError(`Failed to get information of ${body} at the given time`);
		}
		const { sha, dec } = star;
		this.body = { name: body, sha, dec };
	}
	getUnixTime() {
		return Math.floor(this.time/1000);
	}
	buildCircle() {
		const unixTime = this.getUnixTime();
		const ariesGHA = calcAriesGHA(unixTime);
		const { name, sha, dec } = this.body;
		const gha = (sha + ariesGHA)%360;
		const lat = dec;
		const lon = (360 - gha + 180)%360 - 180;
		const gp = [ lat, lon ];
		Logger.log('');
		Logger.log('Body: ' + name);
		Logger.log('SHA = ' + degrees.stringify(sha));
		Logger.log('DEC = ' + degrees.stringify(dec));
		Logger.log('Aries GHA = ' + degrees.stringify(ariesGHA));
		Logger.log('GHA = ' + degrees.stringify(gha));
		Logger.log('GP = ' + degrees.stringify(lat) + ', ' + degrees.stringify(lon));
		let ha = this.alt;
		if (this.index !== null || this.dip !== null) {
			let haCalc = degrees.stringify(ha);
			if (this.index !== null) {
				haCalc += degrees.stringify(-this.index, [ ' + ', ' - ']) + '(index)';
				ha -= this.index;
			}
			if (this.dip !== null) {
				haCalc += ' - ' + degrees.stringify(this.dip) + '(dip)';
				ha -= this.dip;
			}
			Logger.log('Ha = ' + haCalc + ' = ' + degrees.stringify(ha));
		} else {
			Logger.log('Ha = ' + degrees.stringify(ha));
		}
		let ho = ha;
		let hoCalc = degrees.stringify(ha);
		let ref = calcAltRefraction(ha);
		hoCalc += ' - ' + degrees.stringify(ref) + '(refraction)';
		ho -= ref;
		Logger.log('Ho = ' + hoCalc + ' = ' + degrees.stringify(ho));
		const zenith = 90 - ho;
		Logger.log(`Zenith = 90° - ${degrees.stringify(ho)} = ${degrees.stringify(zenith)}`);
		let compAzm = null;
		if (this.dr != null) {
			const trig = new Trig();
			const radDR = this.dr.map(val => val/180*Math.PI);
			const radGP = gp.map(val => val/180*Math.PI);
			compAzm = trig.inDeg(trig.fromRad(calcAzm(radDR, radGP)));
			Logger.log(`Computed azimuth = ${Degrees.stringify(compAzm)}`);
		}
		const circle = {
			center: [ lat, lon ],
			radius: zenith,
			compAzm,
			unixTime,
		};
		this.circles.push(circle);
	}
}
