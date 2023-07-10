import { useOverlay } from "./commons";

export function initRectangle(width, height) {
  const mask = document.createElement("div");
  mask.className = "mask-rectangle";
  mask.style = `position:absolute;top:0;right:0;bottom:0;left:0;background-color:transparent;`;

  const layout = document.createElement("table");
  layout.style = `border-collapse:collapse;`;
  layout.frame = "void";
  layout.rules = "none";

  const tBody = document.createElement("tBody");
  const tRow = document.createElement("tr");

  const tdLeft = document.createElement("td");
  tdLeft.className = "left mask";
  tdLeft.style = `width:0;padding:0;`;
  tRow.appendChild(tdLeft);

  const tdCenter = document.createElement("td");
  tdCenter.className = "center width";
  tdCenter.style = `width:${width};padding:0;`;
  tRow.appendChild(tdCenter);

  const tdRight = document.createElement("td");
  tdRight.className = "right mask";
  tdRight.style = `width:0;padding:0;`;
  tRow.appendChild(tdRight);

  const divTop = document.createElement("div");
  divTop.className = "top mask";
  divTop.style = `height:${height};`;
  tdCenter.appendChild(divTop);

  const divCenter = document.createElement("div");
  divCenter.className = "center height";
  divCenter.style = `height:0;`;
  tdCenter.appendChild(divCenter);

  const divBottom = document.createElement("div");
  divBottom.className = "bottom mask";
  divBottom.style = `height:0;`;
  tdCenter.appendChild(divBottom);

  tBody.appendChild(tRow);
  layout.appendChild(tBody);
  mask.appendChild(layout);

  return mask;
}

export default function enchanceRectangle(
  html,
  pageIdx,
  top,
  right,
  bottom,
  left
) {
  console.log(pageIdx, top, right, bottom, left);
  return useOverlay(html, (overlay) => {
    const pages = overlay.querySelectorAll(".page");
    pages.forEach((page) => {
      const idx = Number(page.getAttribute("data-page"));
      if (isNaN(idx)) {
        throw new Error("页号不是数字");
      }
      page.setAttribute("data-mode", "rectangle");
      page.setAttribute("data-off", JSON.stringify(idx !== pageIdx));

      const centerWidthEl = page.querySelector(".mask-rectangle .center.width");
      const centerHeightEl = page.querySelector(
        ".mask-rectangle .center.height"
      );
      const topEl = page.querySelector(".mask-rectangle .top.mask");
      const rightEl = page.querySelector(".mask-rectangle .right.mask");
      const bottomEl = page.querySelector(".mask-rectangle .bottom.mask");
      const leftEl = page.querySelector(".mask-rectangle .left.mask");

      centerWidthEl.style = `width:${
        idx === pageIdx ? page.offsetWidth - left - right : page.offsetWidth
      }px;padding:0;`;
      centerHeightEl.style = `height:${
        idx === pageIdx ? page.offsetHeight - top - bottom : 0
      }px;`;
      topEl.style = `height:${idx === pageIdx ? top : page.offsetHeight}px;`;
      rightEl.style = `width:${idx === pageIdx ? right : 0}px;padding:0;`;
      bottomEl.style = `height:${idx === pageIdx ? bottom : 0}px;`;
      leftEl.style = `width:${idx === pageIdx ? left : 0}px;padding:0;`;
    });
  });
}
