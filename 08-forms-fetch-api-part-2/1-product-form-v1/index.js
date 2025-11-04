import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

// const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElements = {};
  categories;
  productForm;
  product = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    price: 500,
    discount: 0,
    images: [],
  };
  constructor(productId) {
    this.productId = productId;
    this.isChanged = this.productId;
  }

  async render() {
    await this.getCategories();
    await this.getProductById();
    this.element = this.createElement(this.createTemplate());
    this.selectSubElements();
    this.createListeners();
    return this.element;
  }

  async getCategories() {
    try {
      const url = new URL("/api/rest/categories", BACKEND_URL);
      url.searchParams.set("_sort", "weight");
      url.searchParams.set("_refs", "subcategory");

      this.categories = await fetchJson(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  async getProductById() {
    if (!this.isChanged) {
      return;
    }

    try {
      const url = new URL("api/rest/products", BACKEND_URL);
      url.searchParams.set("id", this.productId);

      const [product] = await fetchJson(url);
      return (this.product = product);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  createElement(template) {
    const element = document.createElement("div");
    element.innerHTML = template;
    return element.firstElementChild;
  }

  createTemplate() {
    const { title, description, price, discount, quantity } = this.product;
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(title)}">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(description)}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
                ${this.createImageListTemplate()}
              </div>
              <button type="button" name="uploadImageButton" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.createCategoryOptionsTemplate()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100" value="${escapeHtml(price.toString())}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0" value="${escapeHtml(discount.toString())}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1" value="${escapeHtml(quantity.toString())}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              ${this.createStatusOptionsTemplate()}
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.isChanged ? "Сохранить товар" : "Добавить товар"}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  createImageListTemplate() {
    const imageList = this.product.images.map(
      ({ url, source }, index) => `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${escapeHtml(source)}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-index=${index} data-delete-handle="" alt="delete">
        </button>
      </li>
    `,
    );

    return `
      <ul class="sortable-list">
      ${imageList.join("")}
      </ul>
    `;
  }

  createCategoryOptionsTemplate() {
    this.categoriesMap = new Map();
    this.categories.map((category) =>
      category.subcategories.map((subcategory) =>
        this.categoriesMap.set(
          subcategory.id,
          `${category.title} > ${subcategory.title}`,
          subcategory.id,
        ),
      ),
    );
    return this.getOptionsTemplate(
      Array.from(this.categoriesMap),
      this.product.subcategory,
    );
  }

  getOptionsTemplate(options, selected) {
    return options
      .map(([key, value]) => {
        const isSelected = key == selected ? "selected" : "";
        return `<option ${isSelected} value="${escapeHtml(key)}">${escapeHtml(value)}</option>`;
      })
      .join("");
  }

  createStatusOptionsTemplate() {
    const statuses = {
      0: "Неактивен",
      1: "Активен",
    };
    return this.getOptionsTemplate(
      Object.entries(statuses),
      this.product.status,
    );
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  createListeners() {
    this.subElements.productForm.onsubmit = this.handleSubmit;
    this.subElements.imageListContainer.addEventListener(
      "pointerdown",
      this.handleImageListContainerPointerDown,
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.save();
  };

  async save() {
    try {
      const formData = new FormData(this.subElements.productForm);

      if (this.isChanged) {
        formData.append("productId", this.productId);
      }

      await fetchJson(new URL("api/rest/products", BACKEND_URL), {
        method: this.isChanged ? "PATCH" : "PUT",
        body: formData,
      });

      this.dispatchProductEvent();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  dispatchProductEvent() {
    const eventType = this.isChanged ? "updated" : "saved";
    const event = new CustomEvent(`product-${eventType}`, {
      detail: { product: this.product },
    });
    this.element.dispatchEvent(event);
  }

  destroyListeners() {
    this.subElements.productForm.onsubmit = null;
    this.subElements.productForm.elements.uploadImageButton.onclick = null;
    this.subElements.imageListContainer.removeEventListener(
      "pointerdown",
      this.handleImageListContainerPointerDown,
    );
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.destroyListeners();
    this.remove();
  }
}
