import fetchJson from "./utils/fetch-json.js";
import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable extends SortableTableV2 {
  loading = false;
  element;

  constructor(
    headersConfig,
    {
      url = "",
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      step = 20,
      start = 1,
      end = start + step,
    } = {},
  ) {
    super(headersConfig, { data: [], sorted, isSortLocally });

    this.url = new URL(url, BACKEND_URL);
    this.step = step;
    this.start = start;
    this.end = end;
    this.isSortLocally = isSortLocally;

    this.render();
    this.createArrowElement();
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = super.createTableTemplate();
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const { id, order } = this.sorted;
    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    return super.getSubElements(element);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove("sortable-table_empty");
      this.data = data;
      this.subElements.body.innerHTML = this.createRowTemplate();
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }

  initEventListeners() {
    super.createListeners();
    window.addEventListener("scroll", this.onWindowScroll);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    this.element.classList.add("sortable-table_loading");

    const data = await fetchJson(this.url);

    this.element.classList.remove("sortable-table_loading");

    return data;
  }

  sort(id, order) {
    this.sorted = { id, order };

    if (this.isSortLocally) {
      super.sort(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  async sortOnServer(id, order) {
    this.start = 1;
    this.end = this.start + this.step;

    const data = await this.loadData(id, order, this.start, this.end);
    this.data = data;
    this.renderRows(data);

    const currentColumn = this.element.querySelector(`[data-id="${id}"]`);

    currentColumn.dataset.order = order;
  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  update(data) {
    if (data.length) {
      const rows = document.createElement("div");
      const template = data
        .map((item) => {
          return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.headerConfig
              .map((column) => {
                if (column.template) {
                  return column.template(item[column.id]);
                }
                return `<div class="sortable-table__cell">${item[column.id]}</div>`;
              })
              .join("")}
          </a>
        `;
        })
        .join("");

      rows.innerHTML = template;
      this.data = [...this.data, ...data];
      this.subElements.body.append(...rows.childNodes);
    }
  }

  destroy() {
    super.destroy();
    window.removeEventListener("scroll", this.onWindowScroll);
  }
}
