import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

export default class Page {
  subElements = {};
  element;
  constructor() {
    this.createElement();
    this.selectSubElements();

    this.onDateSelect = this.onDateSelect.bind(this);
  }

  createTemplate() {
    return `
            <div class="dashboard">
              <div class="content__top-panel">
                <h2 class="page-title">Dashboard</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div data-element="chartsRoot" class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Best sellers</h3>
              <div data-element="sortableTable"></div>
            </div>
          `;
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
  }

  selectSubElements() {
    this.element
      .querySelectorAll("[data-element]")
      .forEach(
        (element) => (this.subElements[element.dataset.element] = element),
      );
  }

  async render() {
    const now = new Date();
    this.to = new Date();
    this.from = new Date(now.setMonth(now.getMonth() - 1));

    this.createRangePicker();
    this.createOrdersChart();
    this.createSalesChart();
    this.createCustomersChart();
    this.createSortableTable();
    this.createDateRageListener();

    this.subElements.rangePicker.append(this.rangePicker.element);
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);
    this.subElements.sortableTable.append(this.sortableTable.element);

    return this.element;
  }

  createOrdersChart() {
    this.ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range: { from: this.from, to: this.to },
      label: "orders",
      link: "#",
    });
  }

  createSalesChart() {
    this.salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range: { from: this.from, to: this.to },
      label: "sales",
      formatHeading: (val) => `$ ${val}`,
    });
  }

  createCustomersChart() {
    this.customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range: { from: this.from, to: this.to },
      label: "customers",
    });
  }

  createSortableTable() {
    this.sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
      sorted: { id: "title", order: "asc" },
      isSortLocally: true,
      start: 0,
    });
  }

  createRangePicker() {
    this.rangePicker = new RangePicker({
      from: this.from,
      to: this.to,
    });
  }

  onDateSelect({ detail }) {
    this.from = detail.from;
    this.to = detail.to;
    this.ordersChart.update(this.from, this.to);
    this.salesChart.update(this.from, this.to);
    this.customersChart.update(this.from, this.to);
    this.updateTable();
  }

  async updateTable() {
    const data = await this.sortableTable.loadData(
      this.sortableTable.sorted.id,
      this.sortableTable.sorted.order,
    );
    this.sortableTable.renderRows(data);
  }

  createDateRageListener() {
    this.rangePicker.element.addEventListener("date-select", this.onDateSelect);
  }

  destroyComponents() {
    Object.values(this.element).forEach((component) => component.destroy());
  }

  destroyListeners() {
    this.rangePicker.element.removeEventListener(
      "date-select",
      this.onDateSelect,
    );
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyComponents();
    this.destroyListeners();
    this.remove();
  }
}
