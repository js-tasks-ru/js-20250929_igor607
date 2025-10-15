export default class NotificationMessage {
  static activeNotification;
  element;
  timerId;

  constructor(message = "", { type = "success", duration = 2000 } = {}) {
    this.type = type;
    this.message = message;
    this.duration = duration;

    this.createElement();
  }

  createNotificationTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`;
  }

  createElement() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.createNotificationTemplate();
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    NotificationMessage.activeNotification = this;
    target.appendChild(this.element);

    setTimeout(() => this.destroy(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.remove();
  }
}
