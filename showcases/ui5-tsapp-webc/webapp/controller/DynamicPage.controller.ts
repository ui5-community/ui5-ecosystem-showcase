/* eslint-disable */
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";

function injectStyle() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
.text {
	display: inline-block;
	font-size: var(--sapFontSize);
	font-family: var(--sapFontFamily);
	color: var(--sapTextColor);
	line-height: normal;
	white-space: pre-line;
	word-wrap: break-word;
	cursor: text;
	margin: 0;
}

.product-info {
	display: flex;
	flex-wrap: wrap;
}

.product-info [ui5-avatar],
.product-info .product-info-cell {
	margin-right: 2rem;
	margin-bottom: 1rem;
}

.product-info-cell {
	display: flex;
	gap: 5px;
	flex-direction: column;
}

.product-description {
	display: inline;
	max-width: 300px;
}

.availability {
	font-size: 1.2rem;
	color: var(--sapPositiveTextColor);
}

.price {
	font-size: 1.2rem;
	color: var(--sapTextColor);
}

.snapped-title-heading {
	display: flex;
	align-items: center;
}
.snapped-title-heading [ui5-avatar] {
	margin-right: 1rem;
}
.snapped-title-heading [ui5-title] {
	font-family: var(--sapObjectHeader_Title_FontFamily);
	color: var(--sapObjectHeader_Title_TextColor);
	padding: 0.3125rem 0 0 0;
	font-size: var(--sapObjectHeader_Title_SnappedFontSize);
	text-overflow: ellipsis;
	min-width: 0;
}
`);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * @namespace ui5.ecosystem.demo.webctsapp.controller
 */
export default class DynamicPage extends Controller {
	public onInit(): void {
		injectStyle();

		// generate some sample data
		const sampleDescriptions = [
			"10 inch Portable DVD",
			"7 inch WidescreenPortable DVD Player w MP3",
			"Astro Laptop 1516",
			"Astro Phone 6",
			"Audio/Video Cable Kit - 4m",
			"Beam Breaker B-1",
			"Beam Breaker B-2",
			"Beam Breaker B-3",
			"Beam Breaker B-4",
			"Camcorder View",
			"Benda Laptop 1408",
			"Cepat Tablet 10.5",
		];

		const images = ["HT-1000.jpg", "HT-1010.jpg", "HT-1022.jpg", "HT-1030.jpg", "HT-2002.jpg", "HT-2026.jpg"];

		const items = [];
		for (let i = 0; i < 20; i++) {
			items.push({
				productID: `HT-${i}`,
				productName: sampleDescriptions[(Math.random() * sampleDescriptions.length) | 0],
				price: `${i.toFixed(2)} EUR`,
				imageSrc: `https://sap.github.io/ui5-webcomponents/images/${images[i % images.length]}`,
			});
		}

		const model = new JSONModel({
			listTitle: "Products",
			items,
		});
		this.getView().setModel(model, "dpModel");
	}
}
