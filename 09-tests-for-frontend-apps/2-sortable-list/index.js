export default class SortableList {
  #moveScheduled = false;
  #childRects = [];

  constructor({ items }) {
    this.items = items;
    this.element = this.createElement();
    this.render();
    this.bindHandlers();
    this.createListeners();
  }

  createElement() {
    const element = document.createElement("ul");
    element.classList.add("sortable-list");
    return element;
  }

  render() {
    this.items.forEach((item) => {
      item.classList.add("sortable-list__item");
      this.element.appendChild(item);
    });
  }

  bindHandlers() {
    this.pointerDownHandler = this.pointerDownHandler.bind(this);
    this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
    this.pointerUpHandler = this.pointerUpHandler.bind(this);
  }

  createListeners() {
    this.element.addEventListener("pointerdown", this.pointerDownHandler);
  }

  createPlaceholder(width, height) {
    const element = document.createElement("li");
    element.className = "sortable-list__placeholder";
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    return element;
  }

  pointerDownHandler(event) {
    const grabHandle = event.target.closest("[data-grab-handle]");
    const deleteHandle = event.target.closest("[data-delete-handle]");

    if (deleteHandle) {
      return this.itemDeleteHandler(deleteHandle);
    }
    if (!grabHandle) {
      return;
    }

    event.preventDefault();
    this.startDragging(grabHandle.closest(".sortable-list__item"), event);
  }

  startDragging(item, event) {
    this.draggedItem = item;

    const { left, top, width, height } = item.getBoundingClientRect();
    this.shiftX = event.clientX - left;
    this.shiftY = event.clientY - top;

    this.startLeft = left;
    this.startTop = top;

    this.placeholder = this.createPlaceholder(width, height);
    item.after(this.placeholder);

    Object.assign(item.style, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
    });

    item.classList.add("sortable-list__item_dragging");

    this.#childRects = Array.from(this.element.children)
      .filter((el) => el !== item && el !== this.placeholder)
      .map((el) => ({ el, rect: el.getBoundingClientRect() }));

    document.addEventListener("pointermove", this.pointerMoveHandler);
    document.addEventListener("pointerup", this.pointerUpHandler);
  }

  pointerMoveHandler(event) {
    const x = event.clientX - this.shiftX;
    const y = event.clientY - this.shiftY;

    this.draggedItem.style.transform = `translate(${x - this.startLeft}px, ${y - this.startTop}px)`;
    // this.draggedItem.style.transform = `translate(${x }px, ${y }px)`;

    if (this.#moveScheduled) {
      return;
    }
    this.#moveScheduled = true;

    requestAnimationFrame(() => {
      this.#moveScheduled = false;
      this.updatePlaceholderPosition(event.clientY);
    });
  }

  updatePlaceholderPosition(posY) {
    const beforeEl = this.#childRects.find(
      ({ rect }) => posY < rect.top + rect.height / 2,
    )?.el;
    if (beforeEl && beforeEl.previousSibling !== this.placeholder) {
      beforeEl.before(this.placeholder);
    } else if (!beforeEl && this.element.lastChild !== this.placeholder) {
      this.element.append(this.placeholder);
    }
  }

  pointerUpHandler() {
    this.placeholder.replaceWith(this.draggedItem);

    this.draggedItem.classList.remove("sortable-list__item_dragging");
    this.draggedItem.style = "";

    this.placeholder.remove();
    this.destroyListeners();
  }

  itemDeleteHandler(handle) {
    handle.closest(".sortable-list__item").remove();
  }

  destroyListeners() {
    document.removeEventListener("pointermove", this.pointerMoveHandler);
    document.removeEventListener("pointerup", this.pointerUpHandler);
    this.#moveScheduled = false;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element.removeEventListener("pointerdown", this.pointerDownHandler);
    this.destroyListeners();
  }
}
