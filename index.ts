import gencUrl from './src/main/ts/armyc2/c5isr/data/genc.json';
import msdUrl from './src/main/ts/armyc2/c5isr/data/msd.json';
import mseUrl from './src/main/ts/armyc2/c5isr/data/mse.json';
import svgdUrl from './src/main/ts/armyc2/c5isr/data/svgd.json';
import svgeUrl from './src/main/ts/armyc2/c5isr/data/svge.json';

if(gencUrl && msdUrl && mseUrl && svgdUrl && svgeUrl)
  console.log("data files located");

import { ErrorLogger } from "./src/main/ts/armyc2/c5isr/renderer/utilities/ErrorLogger";
import { GENCLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/GENCLookup";
import { MSLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MSLookup";
import { SVGLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGLookup";

export { Point } from "./src/main/ts/armyc2/c5isr/graphics2d/Point";
export { Point2D } from "./src/main/ts/armyc2/c5isr/graphics2d/Point2D";
export { Rectangle2D } from "./src/main/ts/armyc2/c5isr/graphics2d/Rectangle2D";
export { Font } from "./src/main/ts/armyc2/c5isr/graphics2d/Font";
export { Color } from "./src/main/ts/armyc2/c5isr/renderer/utilities/Color";
export { AffiliationColors } from "./src/main/ts/armyc2/c5isr/renderer/utilities/AffiliationColors";
export { DistanceUnit } from "./src/main/ts/armyc2/c5isr/renderer/utilities/DistanceUnit";
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
export { SVGLookup } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGLookup";
export { SVGSymbolInfo } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SVGSymbolInfo";
export { SymbolUtilities } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SymbolUtilities";
export { RendererSettings } from "./src/main/ts/armyc2/c5isr/renderer/utilities/RendererSettings";
export { SymbolID } from "./src/main/ts/armyc2/c5isr/renderer/utilities/SymbolID";
export { ShapeInfo } from "./src/main/ts/armyc2/c5isr/renderer/utilities/ShapeInfo";
export { MilStdSymbol } from "./src/main/ts/armyc2/c5isr/renderer/utilities/MilStdSymbol";

export { BasicShapes } from "./src/main/ts/armyc2/c5isr/JavaLineArray/BasicShapes"

export type { IPointConversion } from "./src/main/ts/armyc2/c5isr/renderer/utilities/IPointConversion";
export { PointConverter3D } from "./src/main/ts/armyc2/c5isr/renderer/utilities/PointConverter3D";
export { clsRenderer } from "./src/main/ts/armyc2/c5isr/RenderMultipoints/clsRenderer";
export { RendererUtilities } from "./src/main/ts/armyc2/c5isr/renderer/utilities/RendererUtilities";

export { MilStdIconRenderer } from "./src/main/ts/armyc2/c5isr/renderer/MilStdIconRenderer";
export { WebRenderer } from "./src/main/ts/armyc2/c5isr/web/render/WebRenderer";

import { createCanvas } from 'canvas';

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
 * Additionally, if your build process hashes the manifest.json file, you should include the new name like "/dist/manifest.[hash].json"
 */
export async function initialize(location?:string):Promise<any>
{
  let canvse:any = createCanvas(10,10);
  initializing = true;
  try
  {
    if(!initialized)
    {
      let promises:Array<Promise<any>> = new Array<Promise<any>>()
      let manifestName:string = 'manifest.json';
      let manifestIndex:number = -1;

      //Load data from specific path
      let path:string = "";
      if(location)
      {
        if(location.startsWith('/')==false)
          location = '/' + location;
        manifestIndex = location.indexOf("manifest");
        if(location.endsWith("json") && manifestIndex >= 0)
        {
          manifestName = location.substring(manifestIndex);
          location = location.substring(0,manifestIndex);
        }
        if(location.endsWith('/')==true)
          location = location.substring(0,location.length-1);
        path = location;
      }
        

      //load data from path provided in manifest file/////////////////////
      // Fetch Webpack manifest to get the hashed filename
      const manifestResponse = await fetch(location + "/" + manifestName);
      const manifest = await manifestResponse.json();

      // Get the hashed JSON file URL
      const gencUrl = path + manifest['data/genc.json'];
      const msdUrl = path + manifest['data/msd.json'];
      const mseUrl = path + manifest['data/mse.json'];
      const svgdUrl = path + manifest['data/svgd.json'];
      const svgeUrl = path + manifest['data/svge.json'];

      promises.push(GENCLookup.setData(gencUrl));
      promises.push(MSLookup.setData([msdUrl,mseUrl]));
      promises.push(SVGLookup.setData([svgdUrl,svgeUrl]));

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

export async function init(location?:string)
{
  initializing = true;
  try
  {
    if(!initialized)
    {
      GENCLookup.setDataObject();//(genc);
      MSLookup.setDataObject();//(msd,mse);
      SVGLookup.setDataObject();//(svgd,svge);

      if(GENCLookup.getInstance() && MSLookup.getInstance() && SVGLookup.getInstance())
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
