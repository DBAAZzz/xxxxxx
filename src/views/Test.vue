<template>
  <div class="body">
    <div class="left">
      <div class="item-box">
        <div class="item" v-for="(item, index) in itemList" :key="index">
          <div
            draggable="true"
            v-if="item.type == 'box'"
            :style="{
              background: item.attr.background,
            }"
            @dragstart="itemDragstart($event, item)"
            @dragend="itemDragend"
          ></div>
          <img
            draggable="true"
            @dragstart="itemDragstart($event, item)"
            @dragend="itemDragend"
            v-if="item.type == 'image'"
            :src="item.attr.url"
          />
        </div>
      </div>
    </div>
    <div class="right">
      <div id="canvas-box" style="display: inline-block">
        <div
          :class="{
            'canvas-item': true,
            'canvas-item--active': changeNode.index == index,
          }"
          :tabindex="-1"
          v-for="(item, index) in renderList"
          :ref="`selectNode${index}`"
          :style="{
            zIndex: selectNode.index == index ? 2 : 1,
            top: item.attr.top + 'px',
            left: item.attr.left + 'px',
            width: item.attr.width + 'px',
            height: item.attr.height + 'px',
            transform: `rotate(${item.attr.deg || 0}deg)`,
            background: item.attr.background,
          }"
          :key="index"
          @keyup.delete="deleteItem(index)"
          @keydown.down="keyboardMove(index, 'down')"
          @keydown.up="keyboardMove(index, 'up')"
          @keydown.left="keyboardMove(index, 'left')"
          @keydown.right="keyboardMove(index, 'right')"
        >
          <div
            v-if="item.type == 'box'"
            class="inner"
            @mousedown="moveStart($event, index)"
            @mouseup="moveEnd()"
            @mousemove="moveItem($event, index)"
            @click="changeItem($event, index)"
            draggable="false"
          >
            {{ index }}
          </div>
          <img
            v-else-if="item.type == 'image'"
            :src="item.attr.url"
            class="inner"
            @mousedown="moveStart($event, index)"
            @mouseup="moveEnd()"
            @mousemove="moveItem($event, index)"
            @click="changeItem($event, index)"
            draggable="false"
          />
          <template v-if="changeNode.index == index">
            <img
              class="rotate-icon"
              src="@/assets/icon.png"
              @mousedown="mouseDownItem($event)"
              @mouseup="mouseUpItem()"
              draggable="false"
            />
            <div
              class="icon tl"
              :ref="`labeltlIcon${index}`"
              @mousedown="startMarkerItem($event, 'tl', index)"
              @mouseup="endMarkerItem($event, 'tl', index)"
              @mouseover="endMarkerItem($event, 'tl', index)"
              draggable="false"
            ></div>
            <div
              class="icon tm"
              :ref="`labeltmIcon${index}`"
              @mousedown="startMarkerItem($event, 'tm', index)"
              @mouseup="endMarkerItem($event, 'tm', index)"
              @mouseover="endMarkerItem($event, 'tm', index)"
              draggable="false"
            ></div>
            <div
              class="icon tr"
              :ref="`labeltrIcon${index}`"
              @mousedown="startMarkerItem($event, 'tr', index)"
              @mouseup="endMarkerItem($event, 'tr', index)"
              @mouseover="endMarkerItem($event, 'tr', index)"
              draggable="false"
            ></div>
            <div
              class="icon bl"
              :ref="`labelblIcon${index}`"
              @mousedown="startMarkerItem($event, 'bl', index)"
              @mouseup="endMarkerItem($event, 'bl', index)"
              @mouseover="endMarkerItem($event, 'bl', index)"
              draggable="false"
            ></div>
            <div
              class="icon bm"
              :ref="`labelbmIcon${index}`"
              @mousedown="startMarkerItem($event, 'bm', index)"
              @mouseup="endMarkerItem($event, 'bm', index)"
              @mouseover="endMarkerItem($event, 'bm', index)"
              draggable="false"
            ></div>
            <div
              class="icon br"
              :ref="`labelbrIcon${index}`"
              @mousedown="startMarkerItem($event, 'br', index)"
              @mouseup="endMarkerItem($event, 'br', index)"
              @mouseover="endMarkerItem($event, 'br', index)"
              draggable="false"
            ></div>
            <div
              class="icon lm"
              :ref="`labellmIcon${index}`"
              @mousedown="startMarkerItem($event, 'lm', index)"
              @mouseup="endMarkerItem($event, 'lm', index)"
              @mouseover="endMarkerItem($event, 'lm', index)"
              draggable="false"
            ></div>
            <div
              class="icon rm"
              :ref="`labelrmIcon${index}`"
              @mousedown="startMarkerItem($event, 'rm', index)"
              @mouseup="endMarkerItem($event, 'rm', index)"
              @mouseover="endMarkerItem($event, 'rm', index)"
              draggable="false"
            ></div>
          </template>
        </div>
        <template>
          <div
            class="v-line"
            v-for="item in vLineList"
            :key="item.id"
            :style="{
              top: item.top + 'px',
              left: item.left + 'px',
              width: item.width + 'px',
            }"
          ></div>
          <div
            class="h-line"
            v-for="item in hLineList"
            :key="item.id"
            :style="{
              top: item.top + 'px',
              left: item.left + 'px',
              height: item.height + 'px',
            }"
          ></div>
        </template>
      </div>
      <button class="save-button" @click="saveSetting">??????</button>
      <button class="save-button" @click="showSetting">console</button>
      <button class="save-button" @click="exportCanvas">????????????</button>

      <div id="canvas-box2"></div>
    </div>
  </div>
</template>

<script>
import { createHiDPICanvas } from "@/utils/canvas.js";
export default {
  data() {
    return {
      itemList: [
        {
          type: "box",
          attr: {
            width: 100,
            height: 100,
            background: "red",
          },
        },
        {
          type: "image",
          attr: {
            width: 50,
            height: 50,
            url: "https://p3-passport.byteimg.com/img/user-avatar/7812b7dadb31734fe41c491722b54d54~200x200.png",
          },
        },
        {
          type: "image",
          attr: {
            width: 50,
            height: 50,
            url: "https://p3-passport.byteimg.com/img/user-avatar/bd3efdda61f5b8c3d95f8a2ebb6ec177~100x100.png",
          },
        },
      ],

      renderList: [],
      dragObj: {},
      rect: null,
      canMove: false,
      ctx: null,
      canvas: null,
      selectNode: {},
      changeNode: {},
      vLineMap: {},
      vLineList: [],
      hLineMap: {},
      hLineList: [],
    };
  },
  computed: {
    // vLineList() {
    //   return Object.values(this.vLineMap).flat()
    // }
  },
  created() {
    const setting = localStorage.getItem("setting");
    setting && (this.renderList = JSON.parse(setting));
  },
  mounted() {
    this.listerDrag();
    this.renderCanvas();
  },
  methods: {
    changeItem(event, index) {
      let { x, y } = event;
      if (this.changeNode.index == index) {
        this.changeNode = {};
      } else {
        this.changeNode = {
          index,
          x,
          y,
        };
      }
      console.log(this.changeNode);
    },
    deleteItem(index) {
      this.renderList.splice(index, 1);
    },
    keyboardMove(index, key) {
      let keyFn = {
        left: () => {
          this.renderList[index].attr.left -= 1;
        },
        right: () => {
          this.renderList[index].attr.left += 1;
        },
        up: () => {
          this.renderList[index].attr.top -= 1;
        },
        down: () => {
          this.renderList[index].attr.top += 1;
        },
      };
      keyFn[key]();
      this.canvasRender();
    },
    keyboardHeight(index, key) {
      console.log("ctrl");
    },
    listerDrag() {
      const target = document.getElementById("canvas-box");
      target.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      target.addEventListener("drop", (event) => {
        event.preventDefault();
        if (event.target.id === "canvas-box") {
          console.log("???????????????", this.dragObj);
          if (this.dragObj.type == "box") {
            this.renderList.push({
              id: +new Date(),
              type: this.dragObj.type,
              attr: {
                width: 100,
                height: 100,
                top: 0,
                deg: 0,
                left: 0,
                background: this.dragObj.attr.background,
              },
            });
          } else if (this.dragObj.type == "image") {
            this.renderList.push({
              id: +new Date(),
              type: this.dragObj.type,
              attr: {
                width: 100,
                height: 100,
                top: 0,
                deg: 0,
                left: 0,
                url: this.dragObj.attr.url,
              },
            });
          }
          this.dragObj = {};
          this.renderCanvas();
        }
      });
    },
    renderCanvas() {
      const canvas = createHiDPICanvas(375, 600, 2);
      console.log("canvas", canvas);
      canvas.setAttribute("id", "canvas");
      this.ctx = canvas.getContext("2d");
      this.canvas = canvas;
      document.getElementById("canvas-box2").appendChild(canvas);
      this.canvasRender();
    },
    itemDragstart(event, item) {
      console.log("????????????", event);
      let { target } = event;
      this.dragObj = JSON.parse(JSON.stringify(item));
      console.log("dragObj", this.dragObj);
    },
    itemDragend(event) {
      console.log("????????????", event);
    },
    moveStart(event, index) {
      const { clientX, clientY } = event;
      let { top, left } = JSON.parse(
        JSON.stringify(this.$refs[`selectNode${index}`][0].style)
      );
      this.selectNode = {
        index,
        node: this.$refs[`selectNode${index}`][0],
        top: top.replace("px", ""),
        left: left.replace("px", ""),
        curClientX: clientX,
        curClientY: clientY,
      };
      this.canMove = true;
    },
    moveEnd(event) {
      this.canMove = false;
      this.selectNode = {};
      this.canvasRender();
      console.log("????????????");
      this.vLineList = [];
      this.hLineList = [];
      this.vLineMap = {};
      this.hLineMap = {};
    },
    moveItem(event, index) {
      if (!this.canMove || !this.selectNode.top) return;

      let { clientX, clientY } = event;
      const { curClientX, curClientY, top, left } = this.selectNode;
      let x = clientX - curClientX;
      let y = clientY - curClientY;

      this.renderList[index].attr.left = x + Number(left);
      this.renderList[index].attr.top = y + Number(top);

      for (let i = 0; i < this.renderList.length; i++) {
        if (i == index) continue;
        const { top, left, width, height } = this.renderList[i].attr;
        const {
          top: moveTop,
          left: moveLeft,
          width: moveWidth,
          height: moveHeight,
        } = this.renderList[index].attr;
        this.vLineMap[i] = [];
        this.hLineMap[i] = [];
        // ????????? ??????
        if (Math.abs(moveTop - top) < 5) {
          this.renderList[index].attr.top = top;
          moveTop = top;
        }
        if (Math.abs(moveTop - (top + height)) < 5) {
          this.renderList[index].attr.top = top + height;
          moveTop = top + height;
        }
        if (Math.abs(moveTop - (top + height / 2)) < 5) {
          this.renderList[index].attr.top = top + height / 2;
          moveTop = top + height / 2;
        }
        if (Math.abs(moveHeight / 2 + moveTop - (height / 2 + top)) < 5) {
          this.renderList[index].attr.top = height / 2 + top - moveHeight / 2;
          moveTop = height / 2 + top - moveHeight / 2;
        }
        if (Math.abs(moveTop + moveHeight - (top + height / 2)) < 5) {
          this.renderList[index].attr.top = top + height / 2 - moveHeight;
          moveTop = top + height / 2 - moveHeight;
        }
        if (Math.abs(moveTop + moveHeight - top) < 5) {
          this.renderList[index].attr.top = top - moveHeight;
          moveTop = top - moveHeight;
        }
        if (Math.abs(moveTop + moveHeight - (top + height)) < 5) {
          console.log("???????????????", i);
          this.renderList[index].attr.top = top + height - moveHeight;
          moveTop = top + height - moveHeight;
        }

        // ????????? ??????
        if (Math.abs(moveLeft - left) < 5) {
          this.renderList[index].attr.left = left;
          moveLeft = left;
        }

        if (Math.abs(moveLeft - (width / 2 + left)) < 5) {
          this.renderList[index].attr.left = width / 2 + left;
          moveLeft = width / 2 + left;
        }

        if (Math.abs(moveLeft - (width + left)) < 5) {
          this.renderList[index].attr.left = width + left;
          moveLeft = width + left;
        }

        if (Math.abs(moveLeft + moveWidth - left) < 5) {
          this.renderList[index].attr.left = left - moveWidth;
          moveLeft = left - moveWidth;
        }

        if (Math.abs(moveLeft + moveWidth - (left + width / 2)) < 5) {
          this.renderList[index].attr.left = left + width / 2 - moveWidth;
          moveLeft = left + width / 2 - moveWidth;
        }

        if (Math.abs(moveLeft + moveWidth - (left + width)) < 5) {
          this.renderList[index].attr.left = left + width - moveWidth;
          moveLeft = left + width - moveWidth;
        }

        // ????????? ??????
        if (Math.abs(moveTop - top) == 0) {
          console.log(`index???${i}????????????${index}????????????`);
          this.vLineMap[i].push({
            id: +new Date() + "top_top",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // ????????? ??????
        if (Math.abs(moveTop - (top + height)) == 0) {
          this.vLineMap[i].push({
            id: +new Date() + "top_bottom",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // ????????? ??????
        if (Math.abs(moveTop - (top + height / 2)) == 0) {
          this.vLineMap[i].push({
            id: +new Date() + "mid_mid",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // ????????? ??????
        if (Math.abs(moveHeight / 2 + moveTop - (height / 2 + top)) == 0) {
          this.vLineMap[i].push({
            id: +new Date() + "mid_mid",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveHeight / 2 + moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // ????????? ??????
        if (Math.abs(moveTop + moveHeight - top) == 0) {
          this.vLineMap[i].push({
            id: +new Date() + "bottom_top",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop + moveHeight,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }

        // ????????? ??????
        if (Math.abs(moveTop + moveHeight - (top + height / 2)) == 0) {
          this.vLineMap[i].push({
            id: +new Date() + "bottom_mid",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop + moveHeight,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }

        // ????????? ??????
        if (Math.abs(moveTop + moveHeight - (top + height) == 0)) {
          console.log("?????????");
          this.vLineMap[i].push({
            id: +new Date() + "bottom_bottom",
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop + moveHeight,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }

        // ?????????
        if (Math.abs(moveLeft - left) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_left",
            target: i,
            left: moveLeft,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        // ?????????
        if (Math.abs(moveLeft - (width / 2 + left)) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_mid",
            target: i,
            left: moveLeft,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        // ?????????
        if (Math.abs(moveLeft - (width + left)) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_right",
            target: i,
            left: moveLeft,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        // ?????????
        if (Math.abs(moveLeft + moveWidth - left) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_right",
            target: i,
            left: moveLeft + moveWidth,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        // ?????????
        if (Math.abs(moveLeft + moveWidth - (left + width / 2)) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_right",
            target: i,
            left: moveLeft + moveWidth,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        // ?????????
        if (Math.abs(moveLeft + moveWidth - (left + width)) == 0) {
          this.hLineMap[i].push({
            id: +new Date() + "left_right",
            target: i,
            left: moveLeft + moveWidth,
            top: Math.min(moveTop, top),
            height:
              moveTop > top
                ? Math.max(moveHeight + moveTop - top, height)
                : Math.max(height + top - moveTop, moveHeight),
          });
        }

        this.vLineList = Object.values(this.vLineMap).flat();
        this.hLineList = Object.values(this.hLineMap).flat();
      }

      // this.canvasRender();
    },
    saveSetting() {
      localStorage.setItem("setting", JSON.stringify(this.renderList));
    },
    startMarkerItem(event, name, index) {
      const { clientX, clientY } = event;
      let { top, left, right, bottom, width, height } = JSON.parse(
        JSON.stringify(this.$refs[`selectNode${index}`][0].style)
      );
      this.selectNode = {
        index,
        node: this.$refs[`selectNode${index}`][0],
        top: top.replace("px", ""),
        left: left.replace("px", ""),
        right: right.replace("px", ""),
        bottom: bottom.replace("px", ""),
        width: width.replace("px", ""),
        height: height.replace("px", ""),
        curClientX: clientX,
        curClientY: clientY,
      };
      this.moveMakerItem = true;
      let labelDom = this.$refs[`label${name}Icon${index}`][0];
      labelDom.onmousemove = (ev) => {
        if (!this.moveMakerItem) return;
        let { clientX, clientY } = ev;
        const { curClientX, curClientY, top, left, width, height } =
          this.selectNode;
        let x = clientX - curClientX;
        let y = clientY - curClientY;

        if (name == "tr") {
          this.renderList[index].attr.width = x + Number(width);
          this.renderList[index].attr.height = Number(height) - y;
          this.renderList[index].attr.top = y + Number(top);
        } else if (name == "br") {
          this.renderList[index].attr.width = Number(width) + x;
          this.renderList[index].attr.height = Number(height) + y;
        } else if (name == "tm") {
          this.renderList[index].attr.height = Number(height) - y;
          this.renderList[index].attr.top = y + Number(top);
        } else if (name == "lm") {
          this.renderList[index].attr.width = Number(width) - x;
          this.renderList[index].attr.left = Number(left) + x;
        } else if (name == "rm") {
          this.renderList[index].attr.width = x + Number(width);
        } else if (name == "bm") {
          this.renderList[index].attr.height = Number(height) + y;
        } else if (name == "tl") {
          this.renderList[index].attr.width = Number(width) - x;
          this.renderList[index].attr.height = Number(height) - y;
          this.renderList[index].attr.left = Number(left) + x;
          this.renderList[index].attr.top = Number(top) + y;
        } else if (name == "bl") {
          this.renderList[index].attr.width = Number(width) - x;
          this.renderList[index].attr.height = Number(height) + y;
          this.renderList[index].attr.left = Number(left) + x;
        }
        this.canvasRender();
      };
    },
    endMarkerItem(event, name, index) {
      this.moveMakerItem = false;
      let labelDom = this.$refs[`label${name}Icon${index}`][0];
      labelDom.onmousemove = null;
    },
    showSetting() {
      console.log(this.renderList);
    },
    exportCanvas() {
      console.log("this.canvas", this.canvas);
      const src = this.canvas.toDataURL("image/png");
      this.downloadPic(src, `DBAA_${+new Date()}`);
    },
    downloadPic(src, name) {
      var alink = document.createElement("a");
      alink.href = src;
      alink.download = name;
      alink.click();
    },
    canvasRender() {
      this.ctx.clearRect(0, 0, 375, 600);
      const imageList = [];
      for (let i = 0; i < this.renderList.length; i++) {
        let { left, top, width, height, background } = this.renderList[i].attr;
        if (this.renderList[i].type == "box") {
          this.renderRect(left, top, width, height, background);
        } else if (this.renderList[i].type == "image") {
          imageList.push(this.renderList[i]);
        }
      }
      this.renderImageAll(imageList);
    },
    renderRect(x, y, width, height, background) {
      this.ctx.fillStyle = background;
      this.ctx.fillRect(x, y, width, height);
    },
    async renderImageAll(list) {
      let asyncImage = list.map((item) => {
        return this.loadImage(item);
      });
      let data = await Promise.all(asyncImage);
      for (let i = 0; i < data.length; i++) {
        let { left, top, width, height } = data[i].item.attr;
        this.ctx.drawImage(
          data[i].img,
          0,
          0,
          data[i].img.width,
          data[i].img.height,
          left,
          top,
          width,
          height
        );
      }
    },
    loadImage(item) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.setAttribute("crossOrigin", "anonymous");
        img.onload = function () {
          resolve({
            img,
            item,
          });
        };
        img.src = item.attr.url;
      });
    },
    mouseDownItem(event) {
      let { x: moveX, y: moveY, index } = this.changeNode;
      const { deg = 0, height, width } = this.renderList[index].attr;
      const { x: startX, y: startY } = event;
      let fn = (e) => {
        const { x: endX, y: endY } = e;
        const angle = this.getAngle(
          [moveX + width / 2, moveY + height / 2],
          [startX, startY],
          [endX, endY]
        );
        this.$set(this.renderList[index].attr, "deg", angle + deg || 0);
      };
      window.addEventListener("mousemove", fn);
      window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", fn);
      });
      setTimeout(() => {}, 0);
    },
    mouseUpItem() {
      console.log(2222);
    },
    /**
     * cen????????????
     * first????????????
     * end????????????
     */
    getAngle(cen, first, end) {
      let [cx, cy] = cen;
      let [x1, y1] = first;
      let [x2, y2] = end;
      let c1 = (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI;
      let c2 = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
      let angle;
      c1 = c1 <= -90 ? 360 + c1 : c1;
      c2 = c2 <= -90 ? 360 + c2 : c2;
      //????????????
      angle = Math.floor(c2 - c1);
      angle = angle < 0 ? angle + 360 : angle;
      return angle;
    },
  },
};
</script>


<style lang="scss" scoped>
.body {
  display: flex;
  height: 100vh;
  .left {
    width: 200px;
    background-color: yellowgreen;
    .item-box {
      display: flex;
      align-items: center;
      flex-direction: column;
      .item {
        margin-top: 20px;
      }
      .item > div {
        width: 100px;
        height: 100px;
      }
    }
  }
  .right {
    flex: 1;
    background-color: wheat;
    #canvas-box {
      position: relative;
      width: 375px;
      height: 600px;
      background-color: yellowgreen;
      overflow: hidden;
      .canvas-item {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        cursor: move;
        .inner {
          width: 100%;
          height: 100%;
        }
        &--active {
          border: 1px solid #000;
        }
        .rotate-icon {
          position: absolute;
          top: -60px;
          width: 40px;
          height: 40px;
          cursor: grab;
        }
        .icon {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 8px;
          height: 8px;
          background: #fff;
          border: 1px solid #666;
          z-index: 3;
          &::before {
            position: absolute;
            content: "";
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
          }
        }
        .tl {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }
        .tm {
          top: -5px;
          cursor: ns-resize;
        }
        .tr {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }
        .bl {
          left: -5px;
          bottom: -5px;
          cursor: nesw-resize;
        }
        .lm {
          left: -5px;
          cursor: ew-resize;
        }
        .rm {
          right: -5px;
          cursor: ew-resize;
        }
        .bm {
          bottom: -5px;
          cursor: ns-resize;
        }
        .br {
          right: -5px;
          bottom: -5px;
          cursor: nwse-resize;
        }
      }
      .v-line {
        position: absolute;
        top: 0;
        left: 0;
        height: 0;
        border-top: dashed 1px yellow;
        z-index: 2;
      }
      .h-line {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        border-left: dashed 1px yellow;
        z-index: 2;
      }
    }
    ::v-deep #canvas {
      position: fixed;
      top: 0;
      right: 0;
      display: inline-block;
      background-color: blue !important;
    }
  }
  .save-button {
    display: block;
    margin-top: 40px;
    width: 200px;
    height: 50px;
    background-color: wheat;
    cursor: pointer;
  }
}
</style>