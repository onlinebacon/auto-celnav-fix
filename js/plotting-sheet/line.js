export default class Line {
	constructor(x, y, dx, dy) {
		this.x = x;
		this.y = y;
		const dlen = Math.sqrt(dx*dx + dy*dy);
		this.dx = dx/dlen;
		this.dy = dy/dlen;
	}
	intersectionWith(line) {
		const { x: x1, y: y1, dx: dx1, dy: dy1 } = this;
		const { x: x2, y: y2, dx: dx2, dy: dy2 } = line;
		if (Math.abs(dy2) > Math.abs(dx2)) {
			const c = dx2/dy2;
			const t = (x2 - x1 + (y1 - y2)*c)/(dx1 - dy1*c);
			return { t, x: x1 + t*dx1, y: y1 + t*dy1 };
		} else {
			const c = dy2/dx2;
			const t = (y2 - y1 + (x1 - x2)*c)/(dy1 - dx1*c);
			return { t, y: y1 + t*dy1, x: x1 + t*dx1 };
		}
	}
	rotateDir90() {
		const { x, y, dx, dy } = this;
		return new Line(x, y, dy, - dx);
	}
	tVal(t) {
		const { x, y, dx, dy } = this;
		return [ x + dx*t, y + dy*t ];
	}
}
