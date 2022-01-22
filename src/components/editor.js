import {
  css,
  customElement,
  html,
  LitElement,
  property,
  state,
} from "lit-element";

import "phaser";

import { EditorScene } from "../scenes/editor-scene";

import { CommandInvoker } from "../command/command";
import { GFXLoader } from "../gfx/load/gfx-loader";
import { EMF } from "../data/emf";
import { EntityState } from "../entity-state";
import { MapPropertiesState } from "../map-properties-state";

@customElement("eomap-editor")
export class Editor extends LitElement {
  static EDITOR_ID = "phaser-container";

  static PHASER_DATA_KEYS = ["currentPos", "eyedrop"];

  static COMPONENT_DATA_KEYS = [
    "commandInvoker",
    "emf",
    "selectedTool",
    "layerVisibility",
    "gfxLoader",
    "selectedLayer",
    "selectedDrawID",
    "entityState",
    "mapPropertiesState",
  ];

  static get styles() {
    return css`
      :host {
        overflow: hidden;
        display: grid;
        grid-template-rows: 100%;
        grid-template-columns: 100%;
      }
      .editor {
        grid-column: 1;
        grid-row: 1;
      }
    `;
  }

  @property({ type: CommandInvoker })
  commandInvoker = new CommandInvoker();

  @property({ type: GFXLoader })
  gfxLoader;

  @property({ type: EMF })
  emf;

  @property({ type: String })
  selectedTool;

  @property({ type: Array })
  layerVisibility;

  @property({ type: Number })
  selectedLayer;

  @property({ type: Number })
  selectedDrawID;

  @property({ type: EntityState })
  entityState;

  @property({ type: MapPropertiesState })
  mapPropertiesState;

  @property({ type: Boolean })
  pointerEnabled = true;

  @property({ type: Boolean })
  keyboardEnabled = true;

  @state({ type: Phaser.Game })
  game;

  componentDataForwarders = new Map();

  setupPhaserChangeDataEvents(scene) {
    for (let key of Editor.PHASER_DATA_KEYS) {
      let eventName = "changedata-" + key;
      scene.data.events.on(eventName, (_parent, value, _previousValue) => {
        this.dispatchEvent(new CustomEvent(eventName, { detail: value }));
      });
    }
  }

  setupEntityToolEvents(scene) {
    scene.events.on("request-entity-editor", (entityState) => {
      this.dispatchEvent(
        new CustomEvent("request-entity-editor", { detail: entityState })
      );
    });
  }

  setupComponentDataForwardingToPhaser(scene) {
    this.componentDataForwarders = new Map();
    for (let key of Editor.COMPONENT_DATA_KEYS) {
      scene.data.set(key, this[key]);
      this.componentDataForwarders.set(key, () => {
        scene.data.set(key, this[key]);
      });
    }
  }

  updateInputEnabledState() {
    if (this.game) {
      this.game.input.mouse.enabled = this.pointerEnabled;
      this.game.input.touch.enabled = this.pointerEnabled;
      this.game.input.keyboard.enabled = this.keyboardEnabled;
    }
  }

  async setupPhaser() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }

    let game = new Phaser.Game({
      type: Phaser.AUTO,
      disableContextMenu: true,
      banner: false,
      scale: {
        width: "100%",
        height: "100%",
        zoom: 1,
        parent: this.shadowRoot.querySelector("#" + Editor.EDITOR_ID),
        mode: Phaser.Scale.ScaleModes.RESIZE,
        resizeInterval: 16,
      },
      loader: {
        maxParallelDownloads: 100,
        async: true,
      },
      render: {
        pixelArt: true,
        powerPreference: "high-performance",
      },
      input: {
        mouse: {
          preventDefaultWheel: false,
          preventDefaultDown: false,
          preventDefaultMove: false,
          preventDefaultUp: false,
        },
        touch: {
          capture: false,
        },
      },
    });

    game.events.once("ready", () => {
      let scene = new EditorScene();
      game.scene.add("editor", scene);

      scene.sys.events.once("ready", () => {
        this.setupPhaserChangeDataEvents(scene);
        this.setupComponentDataForwardingToPhaser(scene);
        this.setupEntityToolEvents(scene);
        this.game = game;
        this.updateInputEnabledState();
      });

      game.scene.start("editor");
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("emf") && this.emf) {
      this.setupPhaser();
    }

    if (
      changedProperties.has("pointerEnabled") ||
      changedProperties.has("keyboardEnabled")
    ) {
      this.updateInputEnabledState();
    }

    for (let changed of changedProperties.keys()) {
      let dataForwarder = this.componentDataForwarders.get(changed);
      if (dataForwarder) {
        dataForwarder();
      }
    }
  }

  render() {
    return html` <div id="${Editor.EDITOR_ID}" class="editor"></div> `;
  }

  disconnectedCallback() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    this.componentDataForwarders.clear();
    super.disconnectedCallback();
  }
}
