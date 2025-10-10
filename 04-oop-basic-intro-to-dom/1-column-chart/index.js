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

    this.render();
  }

  get template() {
    return `
			<div class="column-chart ${this.data.length ? "" : "column-chart_loading"}" style="--chart-height: ${this.chartHeight}">
				<div class="column-chart__title">
					${this.label}
					${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ""}
				</div>
				<div class="column-chart__container">
					<div class="column-chart__header">${this.formatHeading(this.value)}</div>
					<div class="column-chart__chart">
						${this.getColumnBody()}
					</div>
				</div>
			</div>
		`;
  }

  getColumnBody(data = this.data) {
    if (!data.length) {
      return "";
    }
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data
      .map((item) => {
        const value = String(Math.floor(item * scale));
        const tooltip = ((item / maxValue) * 100).toFixed(0) + "%";
        return `<div style="--value: ${value}" data-tooltip="${tooltip}"></div>`;
      })
      .join("");
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  update(newData = []) {
    this.data = newData;
    if (!this.data.length) {
      this.element.classList.add("column-chart_loading");
    } else {
      this.element.classList.remove("column-chart_loading");
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
