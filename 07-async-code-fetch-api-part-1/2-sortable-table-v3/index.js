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
      start = 0,
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
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = super.createTableTemplate();
    const element = wrapper.firstElementChild;
    this.createArrowTemplate();

    this.element = element;
    this.subElements = super.getSubElements(element);
    const data = await this.loadData(
      this.sorted.id,
      this.sorted.order,
      this.start,
      this.end,
    );

    this.renderRows(data);
    this.createListeners();
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

  createListeners() {
    super.createListeners();
    window.addEventListener("scroll", this.onWindowScroll);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    try {
      this.url.searchParams.set("_sort", id);
      this.url.searchParams.set("_order", order);
      this.url.searchParams.set("_start", start);
      this.url.searchParams.set("_end", end);

      this.element.classList.add("sortable-table_loading");

      const data = await fetchJson(this.url);

      this.element.classList.remove("sortable-table_loading");

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async sortOnServer(id, order) {
    try {
      super.sortOnServer(id, order);
      const data = await this.loadData(id, order, this.start, this.end);
      this.data = data;
      this.renderRows(data);

      const currentColumn = this.element.querySelector(`[data-id="${id}"]`);

      currentColumn.dataset.order = order;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  onWindowScroll = async () => {
    try {
      const { bottom } = this.element.getBoundingClientRect();
      const { id, order } = this.sorted;

      if (bottom < document.documentElement.clientHeight && !this.loading) {
        this.start = this.end;
        this.end = this.start + this.step;

        this.loading = true;

        const data = await this.loadData(id, order, this.start, this.end);
        this.data = [...this.data, ...data];
        this.updateBody();

        this.loading = false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  destroy() {
    super.destroy();
    window.removeEventListener("scroll", this.onWindowScroll);
  }
}
