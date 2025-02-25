import * as d3 from "./D3 Modules";
import type { plotData } from "../Classes";
import type { divBaseType, svgBaseType, Visual } from "../visual";

export default function addContextMenu(selection: svgBaseType | divBaseType, visualObj: Visual) {
  if (!(visualObj.viewModel.plotProperties.displayPlot
        || visualObj.viewModel.inputSettings.settings.summary_table.show_table
        || visualObj.viewModel.showGrouped)) {
    selection.on("contextmenu", () => { return; });
    return;
  }
  
  // Add double-click handler for direct drill-through
  selection.on('dblclick', (event) => {
    const eventTarget: d3.BaseType = event.target as d3.BaseType;
    const dataPoint: plotData = <plotData>(d3.select(eventTarget).datum());
    
    // Only proceed if we have a data point with identity
    if (dataPoint && dataPoint.identity) {
      // Trigger drill-through
      visualObj.host.commandService.sendDrilldownEvent(dataPoint.identity);
    }
  });
  
  // Modify the context menu to include drill-through option
  selection.on('contextmenu', (event) => {
    const eventTarget: d3.BaseType = event.target as d3.BaseType;
    const dataPoint: plotData = <plotData>(d3.select(eventTarget).datum());
    
    // Check if we have a valid data point with identity
    if (dataPoint && dataPoint.identity) {
      // Get the default context menu options
      const defaultContextMenuOptions = visualObj.host.contextMenuService.getContextMenuOptions();
      
      // Add a custom menu option for drill-through
      const drillThroughOption = {
        name: "Drill through",
        command: {
          execute: () => {
            visualObj.host.commandService.sendDrilldownEvent(dataPoint.identity);
          }
        }
      };
      
      // Combine the default options with our custom option
      const customOptions = [drillThroughOption, ...defaultContextMenuOptions];
      
      // Show the enhanced context menu
      visualObj.host.contextMenuService.showContextMenu({
        dataPoints: [{ identity: dataPoint.identity }],
        position: {
          x: event.clientX,
          y: event.clientY
        },
        menuOptions: customOptions
      });
    } else {
      // Fall back to default behavior if no data point is found
      visualObj.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
        x: event.clientX,
        y: event.clientY
      });
    }
    
    event.preventDefault();
  });
}