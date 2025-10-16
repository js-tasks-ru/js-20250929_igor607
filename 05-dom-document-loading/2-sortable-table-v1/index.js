export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.createElement();
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const cellElements = element.querySelectorAll("[data-element]");
    return Array.from(cellElements).reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  sort(field, order) {
    const column = this.headerConfig.find((item) => item.id === field);
    if (!column) {
      return;
    }

    const direction = order === "asc" ? 1 : -1;
    const { sortType } = column;

    this.data.sort((a, b) => {
      if (sortType === "number") {
        return direction * (a[field] - b[field]);
      }
      if (sortType === "string") {
        return (
          direction *
          a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" })
        );
      }
      return 0;
    });

    this.updateBody();
    this.updateHeaderOrder(field, order);
  }

  createHeaderTemplate() {
    return this.headerConfig
      .map(({ id, title, sortable }) => {
        return `
                <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" >
                  <span>${title}</span>
                </div>
              `;
      })
      .join("");
  }

  createRowTemplate() {
    return this.data
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
  }

  createTableTemplate() {
    return `
            <div class="sortable-table">
              <div data-element="header" class="sortable-table__header sortable-table__row" >
                ${this.createHeaderTemplate()}
              </div>
              <div data-element="body" class="sortable-table__body">
                ${this.createRowTemplate()}
              </div>
              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
          `;
  }

  createElement() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.createTableTemplate();
    this.element = wrapper.firstElementChild;
  }

  updateBody() {
    this.subElements.body.innerHTML = this.createRowTemplate();
  }

  updateHeaderOrder(field, order) {
    const headersElements = this.element.querySelectorAll("[data-id]");
    headersElements.forEach((cell) => {
      if (cell.dataset.id === field) {
        cell.dataset.order = order;
      } else {
        cell.removeAttribute("data-order");
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
