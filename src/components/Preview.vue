<template>
  <div
    style="
      margin-top: 10px;
      height: 400px;
      background-color: #9999e9;
      box-sizing: border-box;
      position: relative;
    "
  >
    <div
      :class="['preview', 'viewport', mode]"
      @click="onClick"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <div ref="ctx" v-html="previewHtml" />
    </div>
    <div class="viewport" style="pointer-events: none">
      <div :style="drawingBoxStyles" />
    </div>
  </div>
</template>

<script>
import enhanceContinueAt from "../utils/enhance_continue_at";
import enhanceRectangle from "../utils/enhance_rectangle";

export default {
  name: "Preview",
  props: {
    previewHtml: String,
    mode: String,
  },
  data() {
    return {
      drawing: false,
      drawingBoxStyles: {
        border: "none",
        position: "absolute",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
      },
      drawOrig: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
    onClick(event) {
      if (!!this.previewHtml && this.mode === "continue") {
        const pxAt = event.target.scrollTop + event.offsetY;
        const pageEl = this.$refs.ctx.querySelector(".page");
        const pxPageHeightWithMargin = 10 + pageEl.offsetHeight;
        const pageIdx = Math.floor(pxAt / pxPageHeightWithMargin);
        const pageAt = Math.max(
          0,
          pxAt - pageIdx * pxPageHeightWithMargin - 10
        );
        console.log(pxAt, pxPageHeightWithMargin, pageIdx, pageAt);

        this.$emit(
          "update",
          enhanceContinueAt(this.previewHtml, pageIdx, pageAt)
        );
      }
    },
    onMouseDown(event) {
      if (
        0 === event.button &&
        !this.drawing &&
        !!this.previewHtml &&
        this.mode === "rectangle"
      ) {
        this.drawing = true;
        this.drawOrig = { x: event.offsetX, y: event.offsetY };

        this.drawingBoxStyles.border = "dashed 1px red";
        this.drawingBoxStyles.top = `${event.offsetY}px`;
        this.drawingBoxStyles.left = `${event.offsetX}px`;
        this.drawingBoxStyles.right = `${
          event.target.clientWidth - event.offsetX
        }px`;
        this.drawingBoxStyles.bottom = `${
          event.target.clientHeight - event.offsetY
        }px`;
      }
    },
    onMouseMove(event) {
      if (
        0 === event.button &&
        this.drawing &&
        !!this.previewHtml &&
        this.mode === "rectangle"
      ) {
        this.drawingBoxStyles.top = `${Math.min(
          this.drawOrig.y,
          event.offsetY
        )}px`;
        this.drawingBoxStyles.left = `${Math.min(
          this.drawOrig.x,
          event.offsetX
        )}px`;
        this.drawingBoxStyles.right = `${
          event.target.clientWidth - Math.max(this.drawOrig.x, event.offsetX)
        }px`;
        this.drawingBoxStyles.bottom = `${
          event.target.clientHeight - Math.max(this.drawOrig.y, event.offsetY)
        }px`;
      }
    },
    onMouseUp(event) {
      if (
        0 === event.button &&
        this.drawing &&
        !!this.previewHtml &&
        this.mode === "rectangle"
      ) {
        this.drawing = false;
        this.drawingBoxStyles.border = "none";

        const x1 = Math.min(this.drawOrig.x, event.offsetX);
        const y1 =
          event.target.scrollTop + Math.min(this.drawOrig.y, event.offsetY);
        const x2 = Math.max(this.drawOrig.x, event.offsetX);
        const y2 =
          event.target.scrollTop + Math.max(this.drawOrig.y, event.offsetY);

        const pageEl = this.$refs.ctx.querySelector(".page");
        const pxPageHeightWithMargin = 10 + pageEl.offsetHeight;

        const pageIdx = Math.floor(y1 / pxPageHeightWithMargin);
        const top = Math.max(0, y1 - pageIdx * pxPageHeightWithMargin - 10);
        const right = Math.max(0, pageEl.offsetLeft + pageEl.offsetWidth - x2);
        const bottom = Math.max(0, (pageIdx + 1) * pxPageHeightWithMargin - y2);
        const left = Math.max(0, x1 - pageEl.offsetLeft);

        this.$emit(
          "update",
          enhanceRectangle(this.previewHtml, pageIdx, top, right, bottom, left)
        );
      }
    },
  },
};
</script>

<style src="../styles/preview.css"></style>

<style>
.viewport {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.preview {
  overflow-x: hidden;
  overflow-y: auto;
}

.preview.normal {
  cursor: move;
}

.preview.continue {
  cursor: row-resize;
}

.preview.rectangle {
  cursor: crosshair;
}

.preview * {
  pointer-events: none;
  user-select: none;
}

.preview .page {
  margin: 10px auto;
  border-radius: 5px;
}

.preview .page > .border {
  border-radius: 5px;
  border: solid 1px black;
}

.preview .page[data-mode="continue"] > .mask-continue-at > .at {
  background-color: rgba(153, 153, 233, 0.5);
}

.preview .page[data-mode="rectangle"] > .mask-rectangle .mask {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>