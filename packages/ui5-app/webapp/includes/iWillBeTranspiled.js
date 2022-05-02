// nothing to see here, just for demo purposes

const [a, ...b] = ["will", "be", "transpiled!"];

const o = {
	async value() {
		return 3;
	},

	async asyncFunction() {
		const value = await this.value();
		return value + 1;
	},

	array() {
		return [1, 1, 2, 3, 5, 8, 13];
	},

	iterateDemo() {
		for (const value of this.array()) {
			console.log("fibonacci", value);
		}
	},

	computedProperty() {
		const propertyName = "name";
		const person = {
			[propertyName]: "John",
		};
		return person;
	},
};
