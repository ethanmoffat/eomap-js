import { Tool } from "./tool";

export class EraseTool extends Tool {
  handleLeftPointerDown(mapEditor) {
    mapEditor.doSetGraphicCommand(
      mapEditor.currentPos.x,
      mapEditor.currentPos.y,
      null
    );
  }

  handleRightPointerDown(mapEditor) {
    mapEditor.doSetGraphicCommand(
      mapEditor.currentPos.x,
      mapEditor.currentPos.y,
      null
    );
  }

  handleLeftPointerUp(mapEditor) {
    mapEditor.commandInvoker.finalizeAggregate();
  }

  handleRightPointerUp(mapEditor) {
    mapEditor.commandInvoker.finalizeAggregate();
  }

  shouldPointerDownOnMove() {
    return true;
  }
}
