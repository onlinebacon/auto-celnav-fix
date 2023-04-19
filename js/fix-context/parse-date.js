const IntRegex = /^\d+$/;

const months = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
];

const getMonthNumber = (month) => {
	month = month.toLowerCase();
	for (let i=0; i<months.length; ++i) {
		const item = months[i];
		if (item === month || item.substring(0, 3) === month) {
			return i + 1;
		}
	}
	return null;
};

const padTwo = (val) => {
	return val.toString().padStart(2, '0');
};

const parseMonthNameDate = (date) => {
	let [ mon, day, year ] = date.split(/\s*,\s*|\s+/);
	const monthNumber = getMonthNumber(mon);
	if (!monthNumber) {
		return null;
	}
	day = day.replace(/(th|st|nd|rd)/, '');
	if (!IntRegex.test(day)) {
		return null;
	}
	if (!IntRegex.test(year)) {
		return null;
	}
	const formatted = `${year}-${padTwo(monthNumber)}-${padTwo(day)}`;
	const obj = new Date(formatted + 'T00:00:00.000Z');
	if (isNaN(obj*1)) {
		return null;
	}
	return formatted;
};

const parseDate = (date) => {
	const temp = parseMonthNameDate(date);
	if (temp != null) {
		return temp;
	}
	const vals = date.split('-');
	if (vals.length !== 3 || vals.find(val => isNaN(val*1)) != null) {
		return null;
	}
	const obj = new Date(date + 'T00:00:00.000Z');
	if (isNaN(obj*1)) {
		return null;
	}
	return date;
};

export default parseDate;
