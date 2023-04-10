const parseDate = (date) => {
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
