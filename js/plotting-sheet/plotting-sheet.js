import { haversine } from '../es6lib/coord.js';
import Degrees from '../es6lib/degrees.js';
import Trig from '../es6lib/trig.js';
import inscribedCircleCenter from './inscribed-circle-center.js';
import Line from './line.js';

const fixedLinesColor = '#666';
const resultLinesColor = '#fff';
const fixedLinesWidth = 1;
const interceptExtra = 50;
const canvasDef = document.createElement('canvas');
const ctxDef = canvasDef.getContext('2d');
const lineDef = new Line();

const arcmins = Degrees.arcMins();
const trig = new Trig().degrees();
const radToDeg = (val) => val/Math.PI*180;
const degToRad = (val) => val/180*Math.PI;
const sightColors = [ '#5fa', '#5af', '#fa5' ];
const getColor = (i) => sightColors[i] ?? '#aaa';

const fixLatLon = ([ lat, lon ]) => {
	if (lat > 90) {
		lat = 180 - lat;
		lon += 180;
	} else if (lat < -90) {
		lat = - 180 - lat;
		lon += 180;
	}
	lon = (lon%360 + 360 + 180)%360 - 180;
	return [ lat, lon ];
};

const drawRotatedTextBelow = (ctx = ctxDef, text, angle, x, y) => {
	ctx.save();
	ctx.textAlign = 'center';
	ctx.translate(x, y);
	if (angle <= Math.PI*0.5 || angle >= Math.PI*1.5) {
		ctx.textBaseline = 'top';
		ctx.rotate(angle);
	} else {
		ctx.textBaseline = 'bottom';
		ctx.rotate(angle + Math.PI);
	}
	ctx.fillText(text, 0, 0);
	ctx.restore();
};

const drawProtractor = (ctx = ctxDef, cx, cy, radius) => {
	ctx.strokeStyle = fixedLinesColor;
	ctx.fillStyle = fixedLinesColor;
	ctx.lineWidth = fixedLinesWidth;
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI*2);
	ctx.font = radius*0.045 + 'px arial';
	const d1 = radius*0.02;
	const d2 = d1*2;
	const d3 = d2*3;
	const textSpace = d1;
	for (let i=0; i<360; ++i) {
		const m10 = i % 10 === 0;
		const r = radius - (m10 ? d2 : d1);
		const ang = degToRad(i);
		const sin = Math.sin(ang);
		const cos = Math.cos(ang);
		const ax = cx + sin*radius;
		const ay = cy - cos*radius;
		const bx = cx + sin*r;
		const by = cy - cos*r;
		ctx.moveTo(ax, ay);
		ctx.lineTo(bx, by);
		if (m10) {
			const x = bx - sin*textSpace;
			const y = by + cos*textSpace;
			drawRotatedTextBelow(ctx, i, ang, x, y);
		}
	}
	ctx.moveTo(cx - radius + d3, cy);
	ctx.lineTo(cx + radius - d3, cy);
	ctx.moveTo(cx, cy - radius + d3);
	ctx.lineTo(cx, cy + radius - d3);
	ctx.moveTo(cx, cy - radius);
	ctx.lineTo(cx, cy - radius*2);
	ctx.moveTo(cx, cy + radius);
	ctx.lineTo(cx, cy + radius*2);
	ctx.moveTo(cx - radius, cy);
	ctx.lineTo(cx - radius*2, cy);
	ctx.moveTo(cx + radius, cy);
	ctx.lineTo(cx + radius*2, cy);
	ctx.stroke();
};

const calcDist = (a, b) => radToDeg(
	haversine(a.map(degToRad), b.map(degToRad))
);

const drawSightLine = (ctx = ctxDef, cx, cy, dx, dy, len, color) => {
	ctx.beginPath();
	const bx = cx + dx*len;
	const by = cy + dy*len;
	ctx.strokeStyle = color;
	ctx.setLineDash([ 4, 6 ]);
	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(bx, by);
	ctx.stroke();
	ctx.setLineDash([]);
};

const drawArrowTip = (ctx = ctxDef, x, y, dx, dy, offset) => {
	const len = 7;
	const [ a, b ] = [
		(dx + dy)*Math.SQRT1_2*len,
		(dy - dx)*Math.SQRT1_2*len,
	];
	const cx = x + dx*offset;
	const cy = y + dy*offset;
	ctx.beginPath();
	ctx.moveTo(cx - a, cy - b);
	ctx.lineTo(cx, cy);
	ctx.lineTo(cx + b, cy - a);
	ctx.stroke();
};

const drawInterceptLine = (ctx = ctxDef, line = lineDef, minT, maxT, color) => {
	ctx.strokeStyle = color;
	const [ ax, ay ] = line.tVal(minT - interceptExtra);
	const [ bx, by ] = line.tVal(maxT + interceptExtra);
	ctx.beginPath();
	ctx.lineTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
	drawArrowTip(ctx, bx, by, line.dx, line.dy, 0);
	drawArrowTip(ctx, bx, by, line.dx, line.dy, -5);
	drawArrowTip(ctx, ax, ay, -line.dx, -line.dy, 0);
	drawArrowTip(ctx, ax, ay, -line.dx, -line.dy, -5);
};

const drawFix = (ctx = ctxDef, x, y, coord) => {
	ctx.fillStyle = resultLinesColor;
	ctx.beginPath();
	ctx.arc(x, y, 3, 0, Math.PI*2);
	ctx.fill();
	ctx.textBaseline = 'bottom';
	ctx.textAlign = 'left';
	const text = coord.map(val => arcmins.stringify(val));
	ctx.font = '16px monospace';
	ctx.fillText(text, x + 15, y - 15);
};

export default class PlottingSheet {
	constructor(canvas = document.createElement('canvas')) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.clear();
		this.updateVars();
	}
	updateVars() {
		const { canvas } = this;
		const { width, height } = canvas;
		this.width = width;
		this.height = height;
		this.scale = Math.min(width, height)*0.49;
		this.cx = Math.floor(width/2) + 0.5;
		this.cy = Math.floor(height/2) + 0.5;
	}
	clear() {
		this.dr = true ? null : [ 0, 0 ];
		this.circles = [];
	}
	run() {
		this.updateVars();
		const { ctx, circles } = this;
		const { width, height, scale, cx, cy } = this;
		ctx.clearRect(0, 0, width, height);
		drawProtractor(ctx, cx, cy, scale);
		const sightLines = [];
		for (let i=0; i<circles.length; ++i) {
			const circle = circles[i];
			const compRad = calcDist(this.dr, circle.center);
			const dist = compRad - circle.radius;
			const azm = circle.compAzm;
			const dx = trig.sin(azm);
			const dy = - trig.cos(azm);
			const x = cx + dx*dist*scale;
			const y = cy + dy*dist*scale;
			const len = dist >= 0 ? 5*scale : -5*scale;
			drawSightLine(ctx, cx, cy, dx, dy, len, getColor(i));
			sightLines.push(new Line(x, y, dx, dy));
		}
		const intercepts = sightLines.map(line => line.rotateDir90());
		for (let i=0; i<intercepts.length; ++i) {
			const intercept = intercepts[i];
			let minT = 0, maxT = 0;
			for (let line of intercepts) {
				if (line === intercept) {
					continue;
				}
				const { t } = intercept.intersectionWith(line);
				minT = Math.min(minT, t);
				maxT = Math.max(maxT, t);
			}
			ctx.fillStyle = ctx.strokeStyle;
			drawInterceptLine(ctx, intercept, minT, maxT, getColor(i));
		}
		const points = [];
		for (let i=1; i<intercepts.length; ++i) {
			for (let j=0; j<i; ++j) {
				const { x, y } = intercepts[i].intersectionWith(intercepts[j]);
				points.push([ x, y ]);
			}
		}
		if (points.length === 1) {
			const [[ x, y ]] = points;
			const coord = this.coordAt(x, y);
			drawFix(ctx, x, y, coord);
			return coord;
		}
		if (points.length === 3) {
			const [ x, y ] = inscribedCircleCenter(...points);
			const coord = this.coordAt(x, y);
			drawFix(ctx, x, y, coord);
			return coord;
		}
		return null;
	}
	coordAt(x, y) {
		const { cx, cy, scale, dr: [ lat, lon ] } = this;
		const dx = x - cx;
		const dy = y - cy;
		const lonScale = Math.cos(degToRad(lat))*scale;
		return fixLatLon([ lat - dy/scale, lon + dx/lonScale ]);
	}
}
