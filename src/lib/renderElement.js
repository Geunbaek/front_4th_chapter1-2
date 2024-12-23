import { cleanupEventManager, setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  cleanupEventManager(container);
  const element = createElement(normalizeVNode(vNode));
  if (container.firstChild) {
    container.replaceChild(element, container.firstChild);
  } else {
    container.append(element);
  }
  setupEventListeners(container);
}
