import { useOverlay } from "./commons";

export default function changeMode(html, mode) {
  return useOverlay(html, (overlay) => {
    const pages = overlay.querySelectorAll(".page");
    pages.forEach((page) => {
      page.setAttribute("data-mode", mode);
    });
  });
}
