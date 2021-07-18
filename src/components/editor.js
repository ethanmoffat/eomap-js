import { css, customElement, html, LitElement } from "lit-element";

import "phaser";

import { Boot } from "../scenes/boot";
import { Preloader } from "../scenes/preloader";
import { Controller } from "../scenes/controller";
import { patchPhaser } from "../patch-phaser";

import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import ScrollerPlugin from "phaser3-rex-plugins/plugins/scroller-plugin";
import SliderPlugin from "phaser3-rex-plugins/plugins/slider-plugin";

@customElement("eomap-editor")
export class Editor extends LitElement {
  static EDITOR_ID = "phaser-container";

  static get styles() {
    return css`
      .editor {
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
    `;
  }

  firstUpdated(_changedProperties) {
    patchPhaser();
    return new Phaser.Game({
      type: Phaser.AUTO,
      disableContextMenu: true,
      scale: {
        width: "100%",
        height: "100%",
        zoom: 1,
        parent: this.shadowRoot.querySelector("#" + Editor.EDITOR_ID),
        mode: Phaser.Scale.ScaleModes.RESIZE,
        resizeInterval: 250,
      },
      loader: {
        maxParallelDownloads: 100,
        async: true,
      },
      render: {
        pixelArt: true,
        powerPreference: "high-performance",
      },
      scene: [Boot, Preloader, Controller],
      plugins: {
        scene: [
          {
            key: "rexUI",
            plugin: UIPlugin,
            mapping: "rexUI",
          },
          {
            key: "scroller",
            plugin: ScrollerPlugin,
            mapping: "scroller",
            start: true,
          },
          {
            key: "slider",
            plugin: SliderPlugin,
            mapping: "slider",
            start: true,
          },
        ],
      },
    });
  }

  render() {
    return html`<div id="${Editor.EDITOR_ID}" class="editor"></div> `;
  }
}
