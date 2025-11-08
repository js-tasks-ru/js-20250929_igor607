import SortableList from "../2-sortable-list/index.js";
// import escapeHtml from "./utils/escape-html.js";
// import fetchJson from "./utils/fetch-json.js";
import ProductFormV1 from "../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";

// const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
// const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm extends ProductFormV1 {
  sortableList;

  setSortableList() {
    const { imageListContainer } = this.subElements;

    const sortableList = new SortableList({
      items: Array.from(
        imageListContainer.querySelectorAll(".sortable-list__item"),
      ),
    });
    imageListContainer.querySelector("ul").replaceWith(sortableList.element);
    this.sortableList = sortableList;
  }

  destroy() {
    super.destroy();
    if (this.sortableList) {
      this.sortableList.destroy();
    }
  }

  async render() {
    await super.render();
    this.setSortableList();
    return this.element;
  }
}
