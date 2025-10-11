export default class ColumnChart {
  chartHeight = 50;
  element;

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.createElement();
  }

  createChartTemplate() {
    return `
			<div class="column-chart ${this.data.length ? "" : "column-chart_loading"}" style="--chart-height: ${this.chartHeight}">
				<div class="column-chart__title">
					${this.label}
					${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ""}
				</div>
				<div class="column-chart__container">
					<div class="column-chart__header">${this.formatHeading(this.value)}</div>
					<div class="column-chart__chart">
						${this.createChartBodyTemplate(this.data)}
					</div>
				</div>
			</div>
		`;
  }

  createChartBodyTemplate(data) {
    if (!data) {
      return "";
    }
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data
      .map((item) => {
        const value = Math.floor(item * scale);
        const tooltip = ((item / maxValue) * 100).toFixed(0) + "%";
        return `<div style="--value: ${value}" data-tooltip="${tooltip}"></div>`;
      })
      .join("");
  }

  createElement() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.createChartTemplate();
    this.element = wrapper.firstElementChild;
  }

  update(newData) {
    this.data = newData;
    const body = this.element.querySelector('[data-element="body"]');
    if (body) {
      body.innerHTML = this.createChartBodyTemplate();
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
