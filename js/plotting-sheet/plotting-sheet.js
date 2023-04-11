import { haversine } from '../es6lib/coord.js';

const fixedLinesColor = '#666';
const userLinesColor = '#5fa';
const fixedLinesWidth = 1;
const canvasDef = document.createElement('canvas');
const ctxDef = canvasDef.getContext('2d');

const radToDeg = (val) => val/Math.PI*180;
const degToRad = (val) => val/180*Math.PI;

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

const drawSightLine = (ctx = ctxDef, cx, cy, azm, len) => {
	ctx.beginPath();
	const ang = degToRad(azm);
	const bx = cx + Math.sin(ang)*len;
	const by = cy - Math.cos(ang)*len;
	ctx.strokeStyle = userLinesColor;
	ctx.setLineDash([ 4, 6 ]);
	ctx.beginPath();
	ctx.moveTo(cx, cy);
	ctx.lineTo(bx, by);
	ctx.stroke();
	ctx.setLineDash([]);
};

const drawInterceptLine = (ctx = ctxDef, cx, cy, azm, dist, len) => {
	const ang1 = degToRad(azm);
	const dx = Math.sin(ang1);
	const dy = -Math.cos(ang1);
	const mx = cx + dx*dist;
	const my = cy + dy*dist;
	const ax = mx + len/2*dy;
	const ay = my - len/2*dx;
	const bx = mx - len/2*dy;
	const by = my + len/2*dx;
	ctx.strokeStyle = userLinesColor;
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
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
		this.scale = Math.min(width, height)*0.4;
		this.cx = Math.floor(width/2) + 0.5;
		this.cy = Math.floor(height/2) + 0.5;
	}
	clear() {
		this.dr = true ? null : [ 0, 0 ];
		this.circles = [];
	}
	draw() {
		this.updateVars();
		const { ctx, circles } = this;
		const { width, height, scale, cx, cy } = this;
		ctx.clearRect(0, 0, width, height);
		drawProtractor(ctx, cx, cy, scale);
		for (let circle of circles) {
			const compRad = calcDist(this.dr, circle.center);
			const dist = compRad - circle.radius;
			const azm = circle.compAzm;
			drawSightLine(ctx, cx, cy, azm, dist >= 0 ? 5*scale : -5*scale);
			drawInterceptLine(ctx, cx, cy, azm, dist*scale, scale*5);
		}
	}
}
