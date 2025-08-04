# 프레임워크 없이 SPA 만들기

## 과제 체크포인트

### 기본과제

#### 가상돔을 기반으로 렌더링하기

- [x] createVNode 함수를 이용하여 vNode를 만든다.
- [x] normalizeVNode 함수를 이용하여 vNode를 정규화한다.
- [x] createElement 함수를 이용하여 vNode를 실제 DOM으로 만든다.
- [x] 결과적으로, JSX를 실제 DOM으로 변환할 수 있도록 만들었다.

#### 이벤트 위임

- [x] 노드를 생성할 때 이벤트를 직접 등록하는게 아니라 이벤트 위임 방식으로 등록해야 한다
- [x] 동적으로 추가된 요소에도 이벤트가 정상적으로 작동해야 한다
- [x] 이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 한다

### 심화 과제

#### 1) Diff 알고리즘 구현

- [x] 초기 렌더링이 올바르게 수행되어야 한다
- [x] diff 알고리즘을 통해 변경된 부분만 업데이트해야 한다
- [x] 새로운 요소를 추가하고 불필요한 요소를 제거해야 한다
- [x] 요소의 속성만 변경되었을 때 요소를 재사용해야 한다
- [x] 요소의 타입이 변경되었을 때 새로운 요소를 생성해야 한다

#### 2) 포스트 추가/좋아요 기능 구현

- [x] 비사용자는 포스트 작성 폼이 보이지 않는다
- [x] 비사용자는 포스트에 좋아요를 클릭할 경우, 경고 메세지가 발생한다.
- [x] 사용자는 포스트 작성 폼이 보인다.
- [x] 사용자는 포스트를 추가할 수 있다.
- [x] 사용자는 포스트에 좋아요를 클릭할 경우, 좋아요가 토글된다.

## 과제 셀프회고

<!-- 과제에 대한 회고를 작성해주세요 -->

### 기술적 성장
<!-- 예시
- 새로 학습한 개념
- 기존 지식의 재발견/심화
- 구현 과정에서의 기술적 도전과 해결
-->

1. 이벤트 위임
  - 공통 조상에 이벤트 핸들러를 하나만 할당하여 자식 요소의 이벤트를 한꺼번에 다룰수 있다.
  - event.target을 이용하여 실제 이벤트가 발행한 자식을 알수 있습니다.
 
2. 이벤트 캡처링
  -  이벤트가 일어난 타겟 엘리먼트까지 이벤트가 전파되는 과정
  
```javascript
// 3번째 인자에 true 값을 줌으로써 캡처링 단계에서 이벤트를 캐치할 수 있다. ( default: false )

addEventListener(eventType, handler, true);
```

3. 이벤트 버블링
  - 이벤트가 일어난 타겟 엘리먼트부터 root 까지 이벤트가 전파되는 과정
 
```javascript
addEventListener(eventType, handler, false);
```

```javascript
<body>
    <div id="root">
        root
        <div id="parents">
            parents
            <div id="child">
                child
            </div>
        </div>
    </div>
    <script>
        const root = document.getElementById("root")
        const parents = document.getElementById("parents")
        const child = document.getElementById("child")
       
        // case 1
        parents.addEventListener("click", () => console.log("parents"), true)
        child.addEventListener("click", () => console.log("child"))
        child.click()
        // parents
        // child

        // case 2
        parents.addEventListener("click", () => console.log("parents"))
        child.addEventListener("click", () => console.log("child"))
        child.click()
        // child
        // parents
    </script>
</body>
```

- 각 element 에 event handler 를 부착하면 버블링이 되면서 모든 동일한 이벤트를 실행하겠지만 위임을 통해 처리되어 있어서 버블링되는 과정을 직접 구현해야한다.

```javascript
function createSyntheticEvent(event) {
  let propagationStopped = false;
  return {
    type: event.type,
    target: event.target,
    currentTarget: event.target,
    preventDefault() {
      event.preventDefault();
    },
    stopPropagation() {
      propagationStopped = true;
      event.stopPropagation();
    },
    isPropagationStopped() {
      return propagationStopped;
    },
    nativeEvent: event,
  };
}

function handleGlobalEvent(event) {
  event = createSyntheticEvent(event);
  const eventType = event.type;
  const handlers = eventManager.get(eventType);
  
  // dom 트리 상위로 이벤트 전파
  let currentElement = event.target;
  while (currentElement && !event.isPropagationStopped()) {
    if (handlers.has(currentElement)) {
      const handler = handlers.get(currentElement);
      handler(event);
    }
    currentElement = currentElement.parentElement;
  }
}
```

4. react 는 왜 VDOM을 사용했는가?

- 선언적 UI
> DOM 조작을 직접 하지 않고, "어떻게 보여야 하는지"만 선언

```javascript
// 명령형 UI (jQuery 스타일)
$('#counter').text(count);
$('#counter').on('click', () => {
  count++;
  $('#counter').text(count);
  if (count > 10) {
    $('#message').show();
  }
});

// 선언적 UI (React 스타일)
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <div onClick={() => setCount(count + 1)}>
        {count}
      </div>
      {count > 10 && <div>카운트가 10을 넘었습니다!</div>}
    </div>
  );
}
```
- 서버 컴포넌트 통합

```javascript
// ServerComponent.server.js
import { db } from './database';

async function ServerComponent() {
  const data = await db.query('SELECT * FROM users');
  
  return (
    <div>
      {data.map(user => (
        <ClientComponent 
          key={user.id} 
          user={user} 
        />
      ))}
    </div>
  );
}

// ClientComponent.client.js
"use client"
function ClientComponent({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {user.name}
      {isExpanded && <UserDetails user={user} />}
    </div>
  );
}
```
- virtual dom 은 실제 dom 보다 경량화된 자바스크립트 객체로 비교 알고리즘을 수행할때 비교적 빠르게 수행가능하다.

### 코드 품질
<!-- 예시
- 특히 만족스러운 구현
- 리팩토링이 필요한 부분
- 코드 설계 관련 고민과 결정
-->

```
Map {
   eventType: WeakMap {
       element: handler
   }
}
```

1. 이벤트 매니저 의 데이터 타입을 위와 같이 구현하여 diff 알고리즘 중 이벤트가 걸려있는 element의 부모가 제거되는 경우 그 하위에 적용되어있는 이벤트 핸들러도 함께 제거될수 있도록 하였습니다. ( WeakMap 의 특징을 활용 )

```javascript
const eventManager = new Map();

export function addEvent(element, eventType, handler) {
  if (!eventManager.has(eventType)) {
    eventManager.set(eventType, new WeakMap());
  }

  const handlerCache = eventManager.get(eventType);
  handlerCache.set(element, handler);
}

export function removeEvent(element, eventType) {
  if (!eventManager.has(eventType)) {
    return;
  }

  const handlerCache = eventManager.get(eventType);
  handlerCache.delete(element);
}
```

2. diff 알고리즘을 통해 실제 변경된 dom 이나 속성만을 변경하여 리렌더링 할 수 있도록 구현하였습니다.

```javascript

function isChangedAttributes(originNewProps, originOldProps) {
  if (
    (!originNewProps && originOldProps) ||
    (originNewProps && !originOldProps)
  ) {
    return true;
  }

  const mergedProps = { ...originOldProps, ...originNewProps };
  return Object.keys(mergedProps ?? {}).some(
    (key) => mergedProps[key] !== originOldProps[key],
  );
}


function updateAttributes(target, originNewProps, originOldProps) {
  Object.keys(originOldProps ?? {}).forEach((key) => {
    if (isEvent(key)) {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType);
      return;
    }

    if (isClassName(key)) {
      target.removeAttribute("class");
      return;
    }

    target.removeAttribute(key);
  });

  Object.keys(originNewProps ?? {}).forEach((key) => {
    if (isEvent(key)) {
      const eventType = key.slice(2).toLowerCase();
      addEvent(target, eventType, originNewProps[key]);
      return;
    }

    if (isClassName(key)) {
      target.setAttribute("class", originNewProps[key]);
      return;
    }

    target.setAttribute(key, originNewProps[key]);
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 새로운 노드가 추가될 경우
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 이전 노드가 삭제된 경우
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  // 노드의 타입이 다른경우
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(
      createElement(newNode),
      parentElement.childNodes[index],
    );
    return;
  }

  // 텍스트 노드일 경우
  if (
    typeof newNode === "string" &&
    typeof oldNode === "string" &&
    newNode !== oldNode
  ) {
    parentElement.replaceChild(
      createElement(newNode),
      parentElement.childNodes[index],
    );
    return;
  }

  if (isChangedAttributes(newNode.props, oldNode.props)) {
    updateAttributes(
      parentElement.childNodes[index],
      newNode.props,
      oldNode.props,
    );
  }

  const newNodeChildren = newNode.children ?? [];
  const oldNodeChildren = oldNode.children ?? [];
  const maxChildren = Math.max(newNodeChildren.length, oldNodeChildren.length);

  for (let i = 0; i < maxChildren; i++) {
    updateElement(
      parentElement.childNodes[index],
      newNodeChildren[i],
      oldNodeChildren[i],
      i,
    );
  }
}

```

### 학습 효과 분석
<!-- 예시
- 가장 큰 배움이 있었던 부분
- 추가 학습이 필요한 영역
- 실무 적용 가능성
-->

1. 추가 학습이 필요한 영역
- react fiber 아키텍쳐를 상세히 공부해서 해당 프로젝트에 적용해보려고 했지만 생각보다 방대한 양에 일단 최대한 더 공부해보고 최소한의 기능 ( useState, useEffect ) 를 구현해볼 계획입니다.
