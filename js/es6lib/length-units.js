const map = {
	'mm': 0.001,
	'cm': 0.01,
	'in': 0.0254,
	'ft': 0.3048,
	'm' : 1,
	'km': 1000,
	'mi': 1609.344,
	'au': 149597870700,
	'ly': 299792458*365.25*86400,
};
const imperial = [ 'in', 'ft', 'mi' ];
const metric = [ 'mm', 'cm', 'm', 'km' ];
const valueRegex = /^\d+(\.\d+)?(e[-+]?\d+)?/i;
export default class LengthUnits {
	constructor(mainUnit = 'm', system = metric, digits = 6) {
		this.mainUnit = mainUnit;
		this.system = system;
		this.digits = digits;
	}
	parse(value) {
		const num = value.match(valueRegex)?.[0];
		if (num === undefined) return NaN;
		const unit = value.replace(valueRegex, '').trim().toLowerCase();
		if (!unit) return Number(num);
		const unitVal = map[unit];
		if (unitVal === undefined) return NaN;
		const meters = Number(num)*unitVal;
		return meters/map[this.mainUnit];
	}
	fromMeters(meters) {
		return meters/map[this.mainUnit];
	}
	toMeters(value) {
		return value*map[this.mainUnit];
	}
	use(unit) {
		return new LengthUnits(unit, this.system, this.digits);
	}
	stringify(value) {
		const meters = this.toMeters(Math.abs(value));
		const { system } = this
		let chosenUnit = system[0];
		for (let i = system.length - 1; i > 0; --i) {
			const unit = system[i];
			const unitVal = map[unit];
			if (meters >= unitVal) {
				chosenUnit = unit;
				break;
			}
		}
		const converted = this.toMeters(value)/map[chosenUnit];
		return Number(converted.toFixed(this.digits)) + ' ' + chosenUnit;
	}
	imperial() {
		return new LengthUnits(this.mainUnit, imperial, this.digits);
	}
	metric() {
		return new LengthUnits(this.mainUnit, metric, this.digits);
	}
}