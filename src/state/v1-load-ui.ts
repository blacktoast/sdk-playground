import { computed, signal } from "@preact/signals";
import { toJs } from "./code";
import {
  createConfigObjectSignal,
  createFieldSignals,
  createJsonSignals,
  resetFieldSignals,
} from "./fields";
import persisted, { prefix } from "./persisted";
import { sdkV1Signal } from "./v1";
import { fields as v1PayFields } from "./v1-pay";

export function reset() {
  resetFieldSignals(fields, fieldSignals);
  userCodeSignal.value = defaultUserCode;
  uiTypeSignal.value = defaultUiType;
  jsonTextSignal.value = "{}";
}

const defaultUserCode = "";
export const userCodeSignal = persisted(
  localStorage,
  `${prefix}.v1-load-ui.userCode`,
  defaultUserCode,
);

const defaultUiType = "";
export const uiTypeSignal = persisted(
  localStorage,
  `${prefix}.v1-load-ui.uiType`,
  defaultUiType,
);

export const pgUiModalOpenSignal = signal(false);
export const playFnSignal = computed(() => {
  const sdkV1 = sdkV1Signal.value;
  const userCode = userCodeSignal.value;
  const uiType = uiTypeSignal.value;
  const configObject = configObjectSignal.value;
  return function loadUI() {
    if (!sdkV1) return Promise.reject(new Error("sdk not loaded"));
    return new Promise((resolve, reject) => {
      if (!userCode) reject(new Error("userCode is empty"));
      sdkV1.IMP.init(userCode);
      sdkV1.IMP.loadUI(uiType, configObject, (response) => {
        resolve(response);
        pgUiModalOpenSignal.value = false;
      });
      pgUiModalOpenSignal.value = true;
    });
  };
});

export const codePreviewSignal = computed<string>(() => {
  const userCode = userCodeSignal.value;
  const uiType = uiTypeSignal.value;
  const uiTypeRepr = JSON.stringify(uiType);
  const configObject = configObjectSignal.value;
  return [
    `<script src="https://cdn.iamport.kr/v1/iamport.js"></script>`,
    ``,
    `<div class="portone-ui-container" data-portone-ui-type=${uiTypeRepr}>`,
    `  <!-- 여기에 PG사 전용 버튼이 그려집니다 -->`,
    `</div>`,
    ``,
    `<script>`,
    `const userCode = ${JSON.stringify(userCode)};`,
    `IMP.init(userCode);`,
    `IMP.loadUI(${uiTypeRepr}, ${toJs(configObject)});`,
    `</script>`,
  ].join("\n");
});

export const fields = v1PayFields;

export const fieldSignals = createFieldSignals(
  localStorage,
  `${prefix}.v1-load-ui.fields`,
  fields,
);
export const { jsonTextSignal, jsonValueSignal } = createJsonSignals(
  localStorage,
  `${prefix}.v1-load-ui.json`,
);
export const configObjectSignal = createConfigObjectSignal({
  fields,
  fieldSignals,
  jsonValueSignal,
});
