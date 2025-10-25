class Tooltip {
  static instance;

  element = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.onPointerOver = this.onPointerOver.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);

    document.addEventListener("pointerover", this.onPointerOver);
    document.addEventListener("pointerout", this.onPointerOut);

    return this;
  }

  render(text = "") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  onPointerOver(event) {
    const target = event.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }

    const text = target.dataset.tooltip;
    this.render(text);
    document.addEventListener("pointermove", this.onPointerMove);
    this.onPointerMove(event);
  }

  onPointerOut(event) {
    const target = event.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }

    this.remove();
    document.removeEventListener("pointermove", this.onPointerMove);
  }
  onPointerMove(event) {
    if (!this.element) {
      return;
    }

    const offsetX = 10;
    const offsetY = 10;
    this.element.style.position = "fixed";
    this.element.style.left = `${event.clientX + offsetX}px`;
    this.element.style.top = `${event.clientY + offsetY}px`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    document.removeEventListener("pointermove", this.onPointerMove);
  }

  destroy() {
    document.removeEventListener("pointerover", this.onPointerOver);
    document.removeEventListener("pointerout", this.onPointerOut);
    document.removeEventListener("pointermove", this.onPointerMove);
    this.remove();
    Tooltip.instance = null;
  }
}

export default Tooltip;
