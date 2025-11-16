export default class DoubleSlider {
  subElements = {};

  constructor({
    min = 130,
    max = 150,
    selected: { from = min, to = max } = {},
    formatValue = (value) => value,
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = { from, to };
    this.formatValue = formatValue;
    this.render();
    this.selectSubElements();
    this.createListeners();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.createTemplate();
    this.element = wrapper.firstElementChild;
  }

  getLeftPercent() {
    const total = this.max - this.min;
    const value = this.selected.from - this.min;

    return Math.round((value / total) * 100) + "%";
  }

  getRightPercent() {
    const total = this.max - this.min;
    const value = this.max - this.selected.to;

    return Math.round((value / total) * 100) + "%";
  }

  createTemplate() {
    const leftPercent = this.getLeftPercent();
    const rightPercent = this.getRightPercent();

    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: ${leftPercent}; right: ${rightPercent};"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${leftPercent};"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${rightPercent};"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `;
  }

  selectSubElements() {
    this.element.querySelectorAll("[data-element]").forEach((element) => {
      this.subElements[element.dataset.element] = element;
    });
  }

  createListeners() {
    this.subElements.thumbLeft.addEventListener(
      "pointerdown",
      this.onPointerDown,
    );
    this.subElements.thumbRight.addEventListener(
      "pointerdown",
      this.onPointerDown,
    );
  }

  onThumbRightPointerMove = (e) => {
    this.selected.to = Math.max(this.selected.from, this.calcRangeValue(e));

    this.subElements.to.textContent = this.formatValue(this.selected.to);
    this.subElements.thumbRight.style.right = this.getRightPercent();
    this.subElements.progress.style.right = this.getRightPercent();
  };

  onThumbLeftPointerMove = (e) => {
    this.selected.from = Math.min(this.selected.to, this.calcRangeValue(e));

    this.subElements.from.textContent = this.formatValue(this.selected.from);
    this.subElements.thumbLeft.style.left = this.getLeftPercent();
    this.subElements.progress.style.left = this.getLeftPercent();
  };

  calcRangeValue = (e) => {
    const { left, width } = this.subElements.inner.getBoundingClientRect();

    const innerLeftX = left;
    const innerRightX = left + width;
    const pointerX = e.clientX;
    const normalizedPointerX = Math.min(
      innerRightX,
      Math.max(innerLeftX, pointerX),
    );
    const percentPointerX = Math.round(
      ((normalizedPointerX - innerLeftX) / (innerRightX - innerLeftX)) * 100,
    );

    return this.min + ((this.max - this.min) * percentPointerX) / 100;
  };

  onPointerMove = (e) => {
    if (this.isThumbRightDown) {
      this.onThumbRightPointerMove(e);
    } else {
      this.onThumbLeftPointerMove(e);
    }
  };

  onPointerDown = (e) => {
    this.element.classList.add("range-slider_dragging");

    this.isThumbRightDown = e.target.dataset.element === "thumbRight";

    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointermove", this.onPointerMove);
  };

  onPointerUp = () => {
    const event = new CustomEvent("range-select", {
      detail: {
        from: this.selected.from,
        to: this.selected.to,
      },
    });

    this.element.dispatchEvent(event);

    this.element.classList.remove("range-slider_dragging");

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  };

  destroyListeners() {
    this.subElements.thumbLeft.removeEventListener(
      "pointerdown",
      this.onPointerDown,
    );
    this.subElements.thumbRight.removeEventListener(
      "pointerdown",
      this.onPointerDown,
    );
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.destroyListeners();
  }
}
