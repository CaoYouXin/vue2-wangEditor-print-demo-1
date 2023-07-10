import { useOverlay } from "./commons";
import { initRectangle } from "./enhance_rectangle";
import { initContinueAt } from "./enhance_continue_at";

function addPage(divCenter, pageSetting, pageCount) {
  const width =
    pageSetting.dir === "landscape" ? pageSetting.longer : pageSetting.shorter;
  const height =
    pageSetting.dir === "landscape" ? pageSetting.shorter : pageSetting.longer;

  const page = document.createElement("div");
  page.className = "page";
  page.style = `width:${width}mm;height:${height}mm;background-color:white;position:relative;box-sizing:border-box;overflow:hidden;`;
  page.setAttribute("data-page", "" + pageCount);
  page.setAttribute("data-mode", pageSetting.mode);

  page.appendChild(addLayout(divCenter, pageSetting));

  page.appendChild(initContinueAt());
  page.appendChild(initRectangle(`${width}mm`, `${height}mm`));

  const border = document.createElement("div");
  border.className = "border";
  border.style = `position:absolute;top:0;right:0;bottom:0;left:0;background-color:transparent;`;
  page.appendChild(border);

  return page;
}

function addLayout(divCenter, pageSetting) {
  const layout = document.createElement("table");
  layout.style = `border-collapse:collapse;`;
  layout.frame = "void";
  layout.rules = "none";

  const tBody = document.createElement("tBody");
  const tRow = document.createElement("tr");

  const tdLeft = document.createElement("td");
  tdLeft.style = `width:${pageSetting.left}mm;padding:0;`;
  tRow.appendChild(tdLeft);

  const tdCenter = document.createElement("td");
  tdCenter.style = `width:${
    (pageSetting.dir === "landscape"
      ? pageSetting.longer
      : pageSetting.shorter) -
    pageSetting.left -
    pageSetting.right
  }mm;padding:0;`;
  tRow.appendChild(tdCenter);

  const tdRight = document.createElement("td");
  tdRight.style = `width:${pageSetting.right}mm;padding:0;`;
  tRow.appendChild(tdRight);

  const divTop = document.createElement("div");
  divTop.style = `height:${pageSetting.top}mm;`;
  tdCenter.appendChild(divTop);

  tdCenter.appendChild(divCenter);

  tBody.appendChild(tRow);
  layout.appendChild(tBody);
  return layout;
}

function calcPxRedLine(page, pageSetting, pageCount) {
  const mmPageWidth =
    pageSetting.dir === "landscape" ? pageSetting.longer : pageSetting.shorter;
  const mmPageHeight =
    pageSetting.dir === "landscape" ? pageSetting.shorter : pageSetting.longer;
  return (
    ((pageCount * mmPageHeight + (mmPageHeight - pageSetting.bottom)) *
      page.clientWidth) /
    mmPageWidth
  );
}

function calcPxPageHeight(page, pageSetting) {
  const mmPageWidth =
    pageSetting.dir === "landscape" ? pageSetting.longer : pageSetting.shorter;
  const mmPageHeight =
    pageSetting.dir === "landscape" ? pageSetting.shorter : pageSetting.longer;
  return (
    ((mmPageHeight - pageSetting.bottom - pageSetting.top) * page.clientWidth) /
    mmPageWidth
  );
}

function newPage(html) {
  const divCenter = document.createElement("div");
  divCenter.className = "w-e-text-container";
  if (html) {
    divCenter.innerHTML = html;
  }
  return divCenter;
}

function nextPage(page, pxRedLine, pxPageHeight) {
  console.log("nextPage start");
  function getWrapper(fnInstance) {
    let instance = null;
    return function (raw) {
      if (raw) return instance;
      if (instance != null) return instance;
      return (instance = fnInstance());
    };
  }

  function breakDown(origWrapper, fnNewWrapper) {
    let el = origWrapper.lastElementChild;

    if (el == null && origWrapper.firstChild instanceof Text) {
      const newWrapper = fnNewWrapper();
      let toNew = true,
        len = origWrapper.lastChild.length;
      while (toNew ? len !== 0 : len > 1) {
        console.log("len", len);
        if (toNew) {
          const newText = origWrapper.lastChild.splitText(len / 2);
          newWrapper.insertBefore(newText, newWrapper.firstChild);
        } else {
          newWrapper.firstChild.splitText(len / 2);
          origWrapper.appendChild(newWrapper.firstChild);
        }

        const clientRect = origWrapper.getBoundingClientRect();
        toNew = clientRect.bottom > pxRedLine;
        len = toNew
          ? origWrapper.lastChild.length
          : newWrapper.firstChild.length;
      }

      origWrapper.normalize();
      newWrapper.normalize();
      return newWrapper;
    }

    while (el != null) {
      const clientRect = el.getBoundingClientRect();
      console.log(
        el.tagName,
        JSON.stringify(clientRect),
        pxRedLine,
        pxPageHeight
      );
      // el = el.previousElementSibling;
      if (clientRect.bottom <= pxRedLine) {
        break;
      }

      let mode = "move"; // or 'break'

      if (clientRect.top < pxRedLine) {
        const style = window.getComputedStyle(el);
        if (style.breakInside === "auto" || style.pageBreakInside === "auto") {
          mode = "break";
        }

        if (clientRect.bottom - clientRect.top > pxPageHeight) {
          mode = "break";
        }
      }

      console.log("mode", mode);

      if (mode === "move") {
        const newWrapper = fnNewWrapper();
        newWrapper.insertBefore(el.cloneNode(true), newWrapper.firstChild);

        const tmpEl = el;
        el = el.previousElementSibling;
        origWrapper.removeChild(tmpEl);
      }

      if (mode === "break") {
        const newWrapper = fnNewWrapper();
        const elClone = el.cloneNode();
        newWrapper.insertBefore(
          breakDown(
            el,
            getWrapper(() => elClone)
          ),
          newWrapper.firstChild
        );

        el = el.previousElementSibling;
      }
    }

    return fnNewWrapper(true);
  }

  const getNewPage = getWrapper(newPage);

  const curDivCenter = page.querySelector(".w-e-text-container");

  return breakDown(curDivCenter, getNewPage);
}

export default function printPreview(html, pageSetting) {
  return useOverlay(null, (overlay) => {
    let page,
      pageCount = 0,
      divCenter = newPage(html);
    while (divCenter != null) {
      const count = pageCount++;
      overlay.appendChild((page = addPage(divCenter, pageSetting, count)));
      divCenter = nextPage(
        page,
        calcPxRedLine(page, pageSetting, count),
        calcPxPageHeight(page, pageSetting)
      );
    }
  });
}
