import fetchJson from "./utils/fetch-json.js";

import ColumnChartV1 from "../../04-oop-basic-intro-to-dom/1-column-chart/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";
export default class ColumnChart extends ColumnChartV1 {
  constructor({
    url = "",
    range = { from: "", to: "" },
    value = 0,
    label = "",
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    super({ data: [], label, value, link, formatHeading });

    this.url = url;
    this.range = range;
    this.update(this.range.from, this.range.to);
    this.subElements = this.getSubElements();
  }

  createUrl() {
    const url = new URL(BACKEND_URL);
    url.pathname = this.url;
    url.searchParams.set("from", this.range.from);
    url.searchParams.set("to", this.range.to);
    return url;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async update(from, to) {
    this.range = { from, to };
    this.element.classList.add("column-chart_loading");

    const data = await fetchJson(this.createUrl());

    if (data && Object.values(data).length) {
      this.element.classList.remove("column-chart_loading");

      const values = Object.values(data);
      const total = values.reduce((acc, value) => acc + value, 0);

      this.subElements.header.textContent = this.formatHeading(total);
      this.subElements.body.innerHTML = this.createChartBodyTemplate(values);
    }

    return data;
  }
}
