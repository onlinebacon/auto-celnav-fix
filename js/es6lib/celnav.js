import Trig from './trig.js';

const trig = new Trig().degrees();

export const calcAriesGHA = (unixTime) => {
	const base = 1656652979.9;
	const day = 86164.09053820801;
	const angle = (unixTime - base)/day*360;
	return (angle%360 + 360)%360;
};

export const calcAltRefraction = (altDegrees) => {
	const arcMins = 1/trig.tan(altDegrees + 7.31/(4.4 + altDegrees));
	return arcMins/60;
};

export const calcDip = (heightMeters) => {
	const r = 7/6*6371e3;
	return trig.acos(r/(r + heightMeters));
};
