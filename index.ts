import { ErrorLogger } from "./src/main/ts/armyc2/c5isr/renderer/utilities/ErrorLogger";
import { GENCLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/GENCLookup";
import { MSLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MSLookup";
import { SVGLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGLookup";

export { Point } from "./src/main/ts/armyc2/c5isr/graphics2d/Point";
export { Point2D } from "./src/main/ts/armyc2/c5isr/graphics2d/Point2D";
export { Rectangle2D } from "./src/main/ts/armyc2/c5isr/graphics2d/Rectangle2D";
export { Font } from "./src/main/ts/armyc2/c5isr/graphics2d/Font";
export { Color } from "./src/main/ts/armyc2/c5isr/renderer/utilities/Color";
export { LogLevel } from "./src/main/ts/armyc2/c5isr/renderer/utilities/LogLevel";
export { ErrorLogger } from "./src/main/ts/armyc2/c5isr/renderer/utilities/ErrorLogger";
export { MilStdAttributes } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MilStdAttributes";
export { Modifiers } from "./src/main/ts/armyc2/c5isr/renderer/utilities/Modifiers";
export { DrawRules } from "./src/main/ts/armyc2/c5isr/renderer/utilities/DrawRules";
export { MODrawRules } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MODrawRules";
export { GENCLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/GENCLookup";
export { MSLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MSLookup";
export { MSInfo } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MSInfo";
export { SVGInfo } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGInfo";
export { SVGSymbolInfo } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGSymbolInfo";
export { SymbolUtilities } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SymbolUtilities";
export { RendererSettings } from "./src/main/ts/armyc2/c5isr/renderer/utilities/RendererSettings";
export { SymbolID } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SymbolID";
export { MilStdSymbol } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MilStdSymbol";
export { MilStdIconRenderer } from "./src/main/ts/armyc2/c5isr/renderer/MilStdIconRenderer";
export { WebRenderer } from "./src/main/ts/armyc2/c5isr/web/render/WebRenderer";



/**
 * Module for rendering 2525D/E symbology
 */

let initialized:boolean = false;
let initializing:boolean = false;
/**
 * Loads files needed by the renderer and initializes its data.
 * Required call before any rendering.
 * Must wait for the returned promise to resolve before any rendering.
 * @param location where renderer and asset files are location.  So if location is "127.0.0.1:8080/dist/C5Ren.js"
 * pass in "/dist/".  This is needed when all the files aren't in the same location.  When the renderer gets imported, it thinks it's 
 * in the location of the file that imported it, not where it actually exists and then it can't find the asset files.  If location is not
 * set, the renderer assumes the json asset files are in the same location as where the C5Ren script is being run.
 */
export async function initialize(location?:string):Promise<any>
{
  initializing = true;
  try
  {
    if(!initialized)
    {
      let promises:Array<Promise<any>> = new Array<Promise<any>>()
      if(location && location.startsWith('/')==false)
        location = '/' + location;
      promises.push(GENCLookup.loadData(location));
      promises.push(MSLookup.loadData(location));
      promises.push(SVGLookup.loadData(location));
      await Promise.all(promises).then(values => {GENCLookup.getInstance();MSLookup.getInstance();SVGLookup.getInstance()}).catch(error => {throw error;});
      initialized=true;
    }
  }
  catch(e)
  {
      throw e;
  }
  finally
  {
    initializing = false;
  }
}

/**
 * Returns true if renderer files are loaded and initialized.
 * @returns boolean
 */
export function isReady():boolean
{
  try
  {
    if(GENCLookup.getInstance() && MSLookup.getInstance() && SVGLookup.getInstance())
      return (GENCLookup.getInstance().isReady() && MSLookup.getInstance().isReady() && SVGLookup.getInstance().isReady());
    else
      return false;
  }
  catch(e)
  {
    ErrorLogger.LogException("C5Ren","isReady()",e);
    return false;
  }
}
