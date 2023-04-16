import Line from './line.js';

const add = ([ ax, ay ], [ bx, by ]) => {
	const x = ax + bx;
	const y = ay + by;
	return [ x, y ];
};

const sub = ([ ax, ay ], [ bx, by ]) => {
	const x = ax - bx;
	const y = ay - by;
	return [ x, y ];
};

const normalize = ([ x, y ]) => {
	const len = Math.sqrt(x*x + y*y);
	x /= len;
	y /= len;
	return [ x, y ];
};

const inscribedCircleCenter = (a, b, c) => {
	const aDir = add(
		normalize(sub(c, a)),
		normalize(sub(b, a)),
	);
	const bDir = add(
		normalize(sub(a, b)),
		normalize(sub(c, b)),
	);
	const aLine = new Line(...a, ...aDir);
	const bLine = new Line(...b, ...bDir);
	const { x, y } = aLine.intersectionWith(bLine);
	return [ x, y ];
};

export default inscribedCircleCenter;
