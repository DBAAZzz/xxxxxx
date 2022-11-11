<template>
  <div class="body">
    <div class="left">
      <div class="item-box">
        <div class="item" v-for="(item, index) in itemList" :key="index">
          <div
            draggable="true"
            :data-type="item.type"
            v-if="item.type == 'box'"
            :style="{
              background: item.attr.background,
            }"
            @dragstart="itemDragstart"
            @dragend="itemDragend"
          ></div>
          <img
            :data-type="item.type"
            draggable="true"
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
          @mousedown="moveStart($event, index)"
          @mouseup="moveEnd()"
          @mousemove="moveItem($event, index)"
          @keyup.delete="deleteItem(index)"
          @click="changeItem(index)"
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
        >
          {{ index }}

          <template v-if="changeNode.index == index">
            <div class="icon tl"></div>
            <div class="icon tr"></div>
            <div class="icon bl"></div>
            <div class="icon br"></div>
          </template>
        </div>
      </div>
      <button class="save-button" @click="saveSetting">保存</button>
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
            url: "https://p3-passport.byteimg.com/img/user-avatar/7812b7dadb31734fe41c491722b54d54~100x100.png",
          },
        },
      ],
      renderList: [],
      dragObj: {},
      rect: null,
      canMove: false,
      selectNode: {},
      changeNode: {},
    };
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
    changeItem(index) {
      if (this.changeNode.index == index) {z 
        this.changeNode = {};
      } else {
        this.changeNode = {
          index,
        };
      }
      console.log(this.changeNode);
    },
    deleteItem(index) {
      this.renderList.splice(index, 1)
    },
    listerDrag() {
      let pics = document.getElementById("canvas-box");
      this.rect = pics.getBoundingClientRect();
      console.log("this.rect", this.rect);

      const target = document.getElementById("canvas-box");
      target.addEventListener("dragover", (event) => {
        event.preventDefault();
      });

      target.addEventListener("drop", (event) => {
        event.preventDefault();
        if (event.target.id === "canvas-box") {
          console.log("拖拽进来了", event);
          this.renderList.push({
            id: +new Date(),
            type: this.dragObj.type,
            attr: {
              width: 100,
              height: 100,
              top: 0,
              left: 0,
              background: "red",
            },
          });
          this.dragObj = {};
          console.log("renderList", this.renderList);
        }
      });
    },
    renderCanvas() {
      const canvas = createHiDPICanvas(375, 600, 2);
      console.log("canvas", canvas);
      canvas.setAttribute("id", "canvas");
      document.getElementById("canvas-box2").appendChild(canvas);
    },
    itemDragstart(event) {
      console.log("开始拖拽", event);
      let { target } = event;
      this.dragObj = {
        type: target.dataset.type,
      };
      console.log("dragObj", this.dragObj);
    },
    itemDragend(event) {
      console.log("拖拽结束", event);
    },
    moveStart(event, index) {
      this.canMove = true;
      const { clientX, clientY } = event;
      let { top, left } = JSON.parse(
        JSON.stringify(this.$refs[`selectNode${index}`][0].style)
      );
      console.log("moveStart", left, top);
      this.selectNode = {
        index,
        node: this.$refs[`selectNode${index}`][0],
        top: top.replace("px", ""),
        left: left.replace("px", ""),
        curClientX: clientX,
        curClientY: clientY,
      };
      console.log("鼠标点击", this.selectNode);
    },
    moveEnd(event) {
      this.canMove = false;
      this.selectNode = {};
      console.log("鼠标松开");
    },
    moveItem(event, index) {
      if (!this.canMove) return;
      let { clientX, clientY } = event;
      let classList = [...event?.target.classList];
      console.log("classList", classList);
      if (classList.includes("canvas-item")) {
        const { curClientX, curClientY, top, left } = this.selectNode;
        let x = clientX - curClientX;
        let y = clientY - curClientY;

        console.log("moveItem", top, left);
        this.renderList[index].attr.left = x + Number(left);
        this.renderList[index].attr.top = y + Number(top);
      } else {
        this.canMove = false;
        const { curClientX, curClientY, top, left } = this.selectNode;
        let x = clientX - curClientX;
        let y = clientY - curClientY;
      }
    },
    saveSetting() {
      localStorage.setItem("setting", JSON.stringify(this.renderList));
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
      .canvas-item {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        cursor: move;
        &--active {
          border: 1px solid #000;
        }
        .icon {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #fff;
          border: 1px solid #666;
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
    margin-top: 100px;
    width: 200px;
    height: 50px;
    background-color: wheat;
    cursor: pointer;
  }
}
</style>