const { PI, sin, cos, tan, asin, acos, atan } = Math;

class Trig {
	constructor(DEG = PI/180, RAD = 1, TO_RAD = 1, TO_DEG = 180/PI) {
		this.DEG = DEG;
		this.RAD = RAD;
		this.TO_RAD = TO_RAD;
		this.TO_DEG = TO_DEG;
	}
	sin(val) { return sin(val*this.TO_RAD); }
	cos(val) { return cos(val*this.TO_RAD); }
	tan(val) { return tan(val*this.TO_RAD); }
	asin(val) { return asin(val)*this.RAD; }
	acos(val) { return acos(val)*this.RAD; }
	atan(val) { return atan(val)*this.RAD; }
	fromDeg(val) { return val*this.DEG; }
	fromRad(val) { return val*this.RAD; }
	inDeg(val) { return val*this.TO_DEG; }
	inRad(val) { return val*this.TO_RAD; }
	radians() { return new Trig(PI/180, 1, 1, 180/PI); }
	degrees() { return new Trig(1, 180/PI, PI/180, 1); }
}

export default Trig;
