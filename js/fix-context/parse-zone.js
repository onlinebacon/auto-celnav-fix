const parseZone = (zone) => {
	let str = zone.trim();
	if (/^(gmt|utc)$/i.test(zone)) {
		return '+0000';
	}
	str = str.replace(/^(gmt|utc)\b/i, '');
	if (!/^[-+]?\s*\d{1,2}(\s*:\s*\d{1,2})?$/.test(str)) {
		return null;
	}
	const sign = str.match(/^[-+]/)?.[0] ?? '+';
	return str.replace(/^[-+]\s*/, sign)
		.replace(/\b(\d)\b/g, '0$1')
		.replace(/\s*:\s*/, '')
		.replace(/\d+/, digits => digits.padEnd(4, '0'));
};

export default parseZone;
