export function useOverlay(html, fn) {
  const overlay = document.createElement("div");
  overlay.style =
    "position:absolute;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,0.8);overflow:auto;";
  if (!!html) overlay.innerHTML = html;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  if (!!fn) fn(overlay);

  const previewHtml = overlay.innerHTML;
  document.body.removeChild(overlay);
  return previewHtml;
}
