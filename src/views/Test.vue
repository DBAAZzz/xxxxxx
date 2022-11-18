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
            <div
              class="icon tl"
              :ref="`labeltlIcon${index}`"
              @mousedown="startMarkerItem($event, 'tl', index)"
              @mouseup="endMarkerItem($event, 'tl', index)"
              @mouseover="endMarkerItem($event, 'tl', index)"
            ></div>
            <div
              class="icon tr"
              :ref="`labeltrIcon${index}`"
              @mousedown="startMarkerItem($event, 'tr', index)"
              @mouseup="endMarkerItem($event, 'tr', index)"
              @mouseover="endMarkerItem($event, 'tr', index)"
            ></div>
            <div
              class="icon bl"
              :ref="`labelblIcon${index}`"
              @mousedown="startMarkerItem($event, 'bl', index)"
              @mouseup="endMarkerItem($event, 'bl', index)"
              @mouseover="endMarkerItem($event, 'bl', index)"
            ></div>
            <div
              class="icon br"
              :ref="`labelbrIcon${index}`"
              @mousedown="startMarkerItem($event, 'br', index)"
              @mouseup="endMarkerItem($event, 'br', index)"
              @mouseover="endMarkerItem($event, 'br', index)"
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
        </template>
      </div>
      <button class="save-button" @click="saveSetting">保存</button>
      <button class="save-button" @click="showSetting">console</button>
      <button class="save-button" @click="exportCanvas">导出图片</button>

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
      if (this.changeNode.index == index) {
        this.changeNode = {};
      } else {
        this.changeNode = {
          index,
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
          console.log("拖拽进来了", this.dragObj);
          if (this.dragObj.type == "box") {
            this.renderList.push({
              id: +new Date(),
              type: this.dragObj.type,
              attr: {
                width: 100,
                height: 100,
                top: 0,
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
      console.log("开始拖拽", event);
      let { target } = event;
      this.dragObj = JSON.parse(JSON.stringify(item));
      console.log("dragObj", this.dragObj);
    },
    itemDragend(event) {
      console.log("拖拽结束", event);
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
      console.log("鼠标松开");
      this.vLineList = [];
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
        // 顶对顶 横条
        if (Math.abs(moveTop - top) < 5) {
          this.renderList[index].attr.top = top;
          moveTop = top;
        } else if (Math.abs(moveTop - (top + height)) < 5) {
          this.renderList[index].attr.top = top + height;
          moveTop = top + height;
        } else if (
          Math.abs(moveHeight / 2 + moveTop - (height / 2 + top)) < 5
        ) {
          this.renderList[index].attr.top = height / 2 + top - moveHeight / 2;
          moveTop = height / 2 + top - moveHeight / 2;
        } else if (Math.abs(moveTop + moveHeight - top) < 5) {
          this.renderList[index].attr.top = top - moveHeight;
          moveTop = top - moveHeight;
        } else if (Math.abs(moveTop + moveHeight - (top + height)) < 5) {
          console.log('底部对底部', i)
          this.renderList[index].attr.top = top + height - moveHeight;
          moveTop = top + height - moveHeight;
        }

        if (Math.abs(moveTop - top) == 0) {
          console.log(`index为${i}的元素与${index}顶部相同`);
          this.vLineMap[i].push({
            id: +new Date(),
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // 顶对底 横条
        else if (Math.abs(moveTop - (top + height)) == 0) {
          this.vLineMap[i].push({
            id: +new Date(),
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // 中对中 横条
        else if (Math.abs(moveHeight / 2 + moveTop - (height / 2 + top)) == 0) {
          this.vLineMap[i].push({
            id: +new Date(),
            target: i,
            left: Math.min(moveLeft, left),
            top: moveHeight / 2 + moveTop,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // 底对顶 横条
        else if (Math.abs(moveTop + moveHeight - top) == 0) {
          this.vLineMap[i].push({
            id: +new Date(),
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop + moveHeight,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // 底对底 横条
        else if (Math.abs(moveTop + moveHeight - (top + height) == 0)) {
          this.vLineMap[i].push({
            id: +new Date(),
            target: i,
            left: Math.min(moveLeft, left),
            top: moveTop + moveHeight,
            width:
              left > moveLeft
                ? width + left - moveLeft
                : Math.max(moveWidth + moveLeft - left, width),
          });
        }
        // console.log("vLineMap", JSON.stringify(this.vLineMap));
        console.log(JSON.stringify(Object.values(this.vLineMap).flat()));
        this.vLineList = Object.values(this.vLineMap).flat();
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
        .icon {
          position: absolute;
          width: 10px;
          height: 10px;
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
        .br {
          right: -5px;
          bottom: -5px;
          cursor: nwse-resize;
        }
      }
      .v-line {
        position: absolute;
        top: 10px;
        left: 0;
        width: 200px;
        height: 2px;
        background-color: yellow;
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