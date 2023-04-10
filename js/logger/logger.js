class LoggerAdapter {
	constructor() {
		this.dom = document.createElement('div');
	}
	setDom(dom) {
		this.dom = dom;
		return this;
	}
	log(text) {
		this.dom.innerText += text + '\n';
		return this;
	}
	clear() {
		this.dom.innerText = '';
	}
}

const Logger = new LoggerAdapter();
export default Logger;
