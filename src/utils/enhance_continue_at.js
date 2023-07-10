import { useOverlay } from "./commons";

export function initContinueAt() {
  const mask = document.createElement("div");
  mask.className = "mask-continue-at";
  mask.style = `position:absolute;top:0;right:0;bottom:0;left:0;background-color:transparent;`;

  const at = document.createElement("div");
  at.className = "at";
  at.style = `width:100%;height:0;`;
  mask.appendChild(at);

  return mask;
}

export default function enhanceContinueAt(html, pageIdx, pageAt) {
  return useOverlay(html, (overlay) => {
    const pages = overlay.querySelectorAll(".page");
    pages.forEach((page) => {
      const idx = Number(page.getAttribute("data-page"));
      if (isNaN(idx)) {
        throw new Error("页号不是数字");
      }
      page.setAttribute("data-mode", "continue");
      page.setAttribute("data-off", JSON.stringify(idx < pageIdx));
      const at = page.querySelector(".mask-continue-at > .at");
      at.style = `width:100%;height:${
        idx < pageIdx ? page.offsetHeight : idx === pageIdx ? pageAt : 0
      }px;`;
    });
  });
}
