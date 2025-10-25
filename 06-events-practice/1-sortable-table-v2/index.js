import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTableV2 extends SortableTableV1 {
  arrowElement;

  constructor(headerConfig = [], options = {}) {
    const { data = [], sorted = {} } = options;

    super(headerConfig, data);

    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;

    this.createListeners();
    this.createArrowTemplate();
    this.createArrowElement();
  }

  createArrowElement() {
    const headerCell = this.element.querySelector(
      `[data-id="${this.sorted.id}"]`,
    );
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.createArrowTemplate();
    this.arrowElement = wrapper.firstElementChild;

    headerCell.dataset.order = this.sorted.order;
    headerCell.append(this.arrowElement);
  }

  createArrowTemplate() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>`;
  }

  handleHeaderCellClick = (e) => {
    const cellElement = e.target.closest(".sortable-table__cell");

    if (!cellElement) {
      return;
    }

    if (cellElement.dataset.sortable !== "true") {
      return;
    }

    const sortField = cellElement.dataset.id;
    const currentOrder = cellElement.dataset.order;
    const sortOrder = currentOrder === "desc" ? "asc" : "desc";

    cellElement.append(this.arrowElement);

    this.sort(sortField, sortOrder);
  };

  sortOnClient(field, order) {
    super.sort(field, order);
  }

  sort(sortField, sortOrder) {
    if (this.isSortLocally) {
      this.sortOnClient(sortField, sortOrder);
    } else {
      this.sortOnServer();
    }
  }

  createListeners() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.handleHeaderCellClick,
    );
  }

  destroyListeners() {
    this.subElements.header.removeEventListener(
      "pointerdown",
      this.handleHeaderCellClick,
    );
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }
}
