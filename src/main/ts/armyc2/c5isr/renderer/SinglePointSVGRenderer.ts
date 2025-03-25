import { type int, type float, type double } from "../graphics2d/BasicTypes";

import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle2D } from "../graphics2d/Rectangle2D"


import { ModifierRenderer } from "../renderer/ModifierRenderer"

import { Color } from "../renderer/utilities/Color"
import { DrawRules } from "../renderer/utilities/DrawRules"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { ImageInfo } from "../renderer/utilities/ImageInfo"
import { MilStdAttributes } from "../renderer/utilities/MilStdAttributes"
import { MSInfo } from "../renderer/utilities/MSInfo"
import { MSLookup } from "../renderer/utilities/MSLookup"
import { RectUtilities } from "../renderer/utilities/RectUtilities"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { SettingsChangedEvent } from "../renderer/utilities/SettingsChangedEvent"
//import { SettingsChangedEventListener } from "../renderer/utilities/SettingsChangedEventListener"
import { SettingsEventListener } from "../renderer/utilities/SettingsEventListener"
import { SVGInfo } from "../renderer/utilities/SVGInfo"
import { SVGLookup } from "../renderer/utilities/SVGLookup"
import { SVGSymbolInfo } from "../renderer/utilities/SVGSymbolInfo"
import { SymbolDimensionInfo } from "../renderer/utilities/SymbolDimensionInfo"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"


import { LogLevel } from "./utilities/LogLevel";
import { ShapeUtilities } from "./utilities/ShapeUtilities";


/**
 *
 */
export class SinglePointSVGRenderer {

    private readonly TAG: string = "SinglePointSVGRenderer";
    private static _instance: SinglePointSVGRenderer;
    public static readonly RENDERER_ID: string = "2525D";
    private _buffer: OffscreenCanvas;
    private _fontRenderContext: OffscreenCanvasRenderingContext2D;


    public constructor() {

    }

    private init(): void {
        try {
            SVGLookup.getInstance();
            ModifierRenderer.getInstance();

            if (this._buffer == null || this._buffer === undefined) 
            {
                this._buffer = new OffscreenCanvas(8,8);
                this._fontRenderContext = this._buffer.getContext("2d");
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("SinglePointRenderer", "init", exc);
            } else {
                throw exc;
            }
        }
    }

    public static getInstance(): SinglePointSVGRenderer {
        if (!SinglePointSVGRenderer._instance) {
            SinglePointSVGRenderer._instance = new SinglePointSVGRenderer();
            SinglePointSVGRenderer._instance.init();
        }

        return SinglePointSVGRenderer._instance;
    }


    public render(symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>): SVGSymbolInfo {
        let si: SVGSymbolInfo;//new SinglePointInfo(null, x, y);


        if (modifiers == null) {
            modifiers = new Map<string, string>();
        }

        if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_ControlMeasure ||
            SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_Atmospheric ||
            SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_Oceanographic ||
            SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_MeteorologicalSpace) {
            //30022500001310010000
            si = this.RenderSP(symbolID, modifiers, attributes);
        }
        else {
            //30020100001107000000
            si = this.RenderUnit(symbolID, modifiers, attributes);
        }

        return si;
    }

    public RenderUnit(symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>): SVGSymbolInfo {
        let ii: ImageInfo;//new SinglePointInfo(null, x, y);
        let si: SVGSymbolInfo = null;
        let newSDI: SymbolDimensionInfo = null;
        try {
            let lineColor: string = null;//SymbolUtilitiesD.getLineColorOfAffiliation(symbolID);
            let fillColor: string = null;
            
            if(SymbolID.getSymbolSet(symbolID)==SymbolID.SymbolSet_MineWarfare && RendererSettings.getInstance().getSeaMineRenderMethod()==RendererSettings.SeaMineRenderMethod_MEDAL)
            {
                lineColor = RendererUtilities.colorToHexString(SymbolUtilities.getLineColorOfAffiliation(symbolID), false);
                fillColor = RendererUtilities.colorToHexString(SymbolUtilities.getFillColorOfAffiliation(symbolID), true);
            }
            
            let iconColor: string = null;

            let alpha: float = -1;

            //SVG values
            let frameID: string = null;
            let iconID: string = null;
            let mod1ID: string = null;
            let mod2ID: string = null;
            let siFrame: SVGInfo = null;
            let siIcon: SVGInfo = null;
            let siMod1: SVGInfo = null;
            let siMod2: SVGInfo = null;
            let top: int = 0;
            let left: int = 0;
            let width: int = 0;
            let height: int = 0;
            let svgStart: string = null;
            let strSVG: string = null;
            let strSVGFrame: string = null;


            let symbolBounds: Rectangle2D = null;
            let fullBounds: Rectangle2D = null;
            let fullBMP: ImageBitmap = null;

            let hasDisplayModifiers: boolean = false;
            let hasTextModifiers: boolean = false;

            let pixelSize: int = 50;
            let keepUnitRatio: boolean = true;
            let scale: double = 1.0;
            let icon: boolean = false;
            let asIcon: boolean = false;
            let noFrame: boolean = false;

            let ver: int = SymbolID.getVersion(symbolID);


            // <editor-fold defaultstate="collapsed" desc="Parse Attributes">
            try 
            {
                if(attributes != null)
                {
                    if (attributes.has(MilStdAttributes.PixelSize)) {
                        pixelSize = parseInt(attributes.get(MilStdAttributes.PixelSize));
                    }
                    else {
                        pixelSize = RendererSettings.getInstance().getDefaultPixelSize();
                    }

                    if (attributes.has(MilStdAttributes.KeepUnitRatio)) {
                        keepUnitRatio = attributes.get(MilStdAttributes.KeepUnitRatio).toLowerCase() === 'true';
                    }

                    if (attributes.has(MilStdAttributes.DrawAsIcon)) {
                        icon = attributes.get(MilStdAttributes.DrawAsIcon).toLowerCase() === 'true';
                    }

                    if (icon)//icon won't show modifiers or display icons
                    {
                        //TODO: symbolID modifications as necessary
                        keepUnitRatio = false;
                        hasDisplayModifiers = false;
                        hasTextModifiers = false;
                        //symbolID = symbolID.substring(0, 10) + "-----";
                    }
                    else {
                        hasDisplayModifiers = ModifierRenderer.hasDisplayModifiers(symbolID, modifiers);
                        hasTextModifiers = ModifierRenderer.hasTextModifiers(symbolID, modifiers);
                    }

                    if (attributes.has(MilStdAttributes.LineColor)) {
                        lineColor = attributes.get(MilStdAttributes.LineColor);
                    }
                    if (attributes.has(MilStdAttributes.FillColor)) {
                        fillColor = attributes.get(MilStdAttributes.FillColor);
                    }
                    if (attributes.has(MilStdAttributes.IconColor))
                    {
                        iconColor = attributes.get(MilStdAttributes.IconColor);
                    }//*/
                    if (attributes.has(MilStdAttributes.Alpha)) {
                        alpha = parseFloat(attributes.get(MilStdAttributes.Alpha));
                    }
                }

            } catch (excModifiers) {
                if (excModifiers instanceof Error) {
                    ErrorLogger.LogException("MilStdIconRenderer", "RenderUnit", excModifiers);
                } else {
                    throw excModifiers;
                }
            }
            // </editor-fold>


            //let key: string = SinglePointSVGRenderer.makeCacheKey(symbolID, lineColor, fillColor, pixelSize, keepUnitRatio, false);;
            //see if it's in the cache
            /*if(_unitCache != null)
            {
                ii = _unitCache[key];
            }//*/

            if (ii == null) //ii is always null because the above check is commented out
            {

                let version: int = SymbolID.getVersion(symbolID);
                //Get SVG pieces of symbol
                frameID = SVGLookup.getFrameID(symbolID);
                iconID = SVGLookup.getMainIconID(symbolID);
                mod1ID = SVGLookup.getMod1ID(symbolID);
                mod2ID = SVGLookup.getMod2ID(symbolID);
                siFrame = SVGLookup.getInstance().getSVGLInfo(frameID, version);
                siIcon = SVGLookup.getInstance().getSVGLInfo(iconID, version);

                if (siFrame == null) {
                    frameID = SVGLookup.getFrameID(SymbolUtilities.reconcileSymbolID(symbolID));
                    siFrame = SVGLookup.getInstance().getSVGLInfo(frameID, version);
                    if (siFrame == null)//still no match, get unknown frame
                    {
                        frameID = SVGLookup.getFrameID(SymbolID.setSymbolSet(symbolID, SymbolID.SymbolSet_Unknown));
                        siFrame = SVGLookup.getInstance().getSVGLInfo(frameID, version);
                    }
                }

                if (siIcon == null) {
                    if (iconID.substring(2, 8) === "000000" === false && MSLookup.getInstance().getMSLInfo(symbolID) == null) {

                        siIcon = SVGLookup.getInstance().getSVGLInfo("98100000", version);
                    }
                    //inverted question mark
                    else {
                        if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_Unknown) {

                            siIcon = SVGLookup.getInstance().getSVGLInfo("00000000", version);
                        }

                    }
                    //question mark
                }

                siMod1 = SVGLookup.getInstance().getSVGLInfo(mod1ID, version);
                siMod2 = SVGLookup.getInstance().getSVGLInfo(mod2ID, version);
                top = Math.round(siFrame.getBbox().getY());
                left = Math.round(siFrame.getBbox().getX());
                width = Math.round(siFrame.getBbox().getWidth());
                height = Math.round(siFrame.getBbox().getHeight());

                //update line and fill color of frame SVG
                if (lineColor != null || fillColor != null) {

                    strSVGFrame = RendererUtilities.setSVGFrameColors(symbolID, siFrame.getSVG(), RendererUtilities.getColorFromHexString(lineColor), RendererUtilities.getColorFromHexString(fillColor));
                }

                else {

                    strSVGFrame = siFrame.getSVG();
                }


                if (frameID === "octagon")//for the 1 unit symbol that doesn't have a frame: 30 + 15000
                {
                    noFrame = true;
                    strSVGFrame = strSVGFrame.replace("<g id=\"octagon\">", "<g id=\"octagon\" display=\"none\">");
                }


                //get SVG dimensions and target dimensions
                symbolBounds = new Rectangle2D(left, top, width, height);
                let rect: Rectangle2D = RectUtilities.copyRect(symbolBounds);
                let ratio: float = -1;

                if (pixelSize > 0 && keepUnitRatio === true) {
                    let heightRatio: float = SymbolUtilities.getUnitRatioHeight(symbolID);
                    let widthRatio: float = SymbolUtilities.getUnitRatioWidth(symbolID);

                    if (noFrame === true)//using octagon with display="none" as frame for a 1x1 shape
                    {
                        heightRatio = 1.0;
                        widthRatio = 1.0;
                    }

                    if (heightRatio > widthRatio) {
                        pixelSize = ((pixelSize / 1.5) * heightRatio) as int;
                    }
                    else {
                        pixelSize = ((pixelSize / 1.5) * widthRatio) as int;
                    }
                }
                if (pixelSize > 0) {
                    let p: float = pixelSize;
                    let h: float = rect.getHeight() as float;
                    let w: float = rect.getWidth() as float;

                    ratio = Math.min((p / h), (p / w));

                    symbolBounds = RectUtilities.makeRectangle2DFromRect(0, 0, w * ratio, h * ratio);
                }

                let sbGroupUnit:string = "";
                if (siFrame != null) {
                    
                    sbGroupUnit += ("<g transform=\"translate(" + (siFrame.getBbox().getX() * -ratio) + ',' + (siFrame.getBbox().getY() * -ratio) + ") scale(" + ratio + "," + ratio + ")\"" + ">");
                    if (siFrame != null) {

                        sbGroupUnit += (strSVGFrame);
                    }
                    //(siFrame.getSVG());
                    
                    let color:string="";
                    if(iconColor != null)
                    {
                        //make sure string is properly formatted.
                        iconColor = RendererUtilities.colorToHexString(RendererUtilities.getColorFromHexString(iconColor),false);
                        if(iconColor != null && iconColor != "#000000" && iconColor != "")
                            color = " stroke=\"" + iconColor + "\" fill=\"" + iconColor + "\" ";
                        else
                            iconColor = null;
                    }
                    let unit:string = "<g" + color + ">";
                    if (siIcon != null) 
                        unit += (siIcon.getSVG());
                    if (siMod1 != null)
                        unit += (siMod1.getSVG());
                    if (siMod2 != null)
                        unit += (siMod2.getSVG());
                    if(iconColor)
                        unit = unit.replaceAll("#000000",iconColor);
                    unit += "</g>";
                    
                    sbGroupUnit += unit + "</g>";
                }




                //center of octagon is the center of all unit symbols
                let centerOctagon: Point = new Point(306, 396);
                ShapeUtilities.offset(centerOctagon,-left,-top);
                //centerOctagon.translate(-left, -top);//offset for the symbol bounds x,y
                //scale center point by same ratio as the symbol
                centerOctagon = new Point((centerOctagon.x * ratio) as int, (centerOctagon.y * ratio) as int);

                //set centerpoint of the image
                let centerPoint: Point = centerOctagon;
                let centerCache: Point = new Point(centerOctagon.x, centerOctagon.y);

                //y offset to get centerpoint so we set back to zero when done.
                //symbolBounds.top = 0;
                RectUtilities.shift(symbolBounds, 0, -symbolBounds.getY() as int);

                //Add core symbol to SVGSymbolInfo
                let anchor: Point2D = new Point2D(symbolBounds.getCenterX(), symbolBounds.getCenterY());
                si = new SVGSymbolInfo(sbGroupUnit.toString().valueOf(), anchor, symbolBounds, symbolBounds);

                hasDisplayModifiers = ModifierRenderer.hasDisplayModifiers(symbolID, modifiers);
                hasTextModifiers = ModifierRenderer.hasTextModifiers(symbolID, modifiers);
                //process display modifiers
                if (hasDisplayModifiers) {
                    newSDI = ModifierRenderer.processUnitDisplayModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                    if (newSDI != null) {
                        si = newSDI as SVGSymbolInfo;
                        newSDI = null;
                    }
                }
            }

            //process text modifiers
            if (hasTextModifiers) 
            {
                if(modifiers == null)
                    modifiers = new Map<string,string>();
                let ss: int = SymbolID.getSymbolSet(symbolID);
                switch (ss) {
                    case SymbolID.SymbolSet_LandUnit:
                    case SymbolID.SymbolSet_LandCivilianUnit_Organization: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processLandUnitTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processLandUnitTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_LandEquipment:
                    case SymbolID.SymbolSet_SignalsIntelligence_Land: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processLandEquipmentTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processLandEquipmentTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_LandInstallation: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processLandInstallationTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processLandInstallationTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_DismountedIndividuals: {
                        newSDI = ModifierRenderer.processDismountedIndividualsTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        break;
                    }

                    case SymbolID.SymbolSet_Space:
                    case SymbolID.SymbolSet_SpaceMissile:
                    case SymbolID.SymbolSet_Air:
                    case SymbolID.SymbolSet_AirMissile:
                    case SymbolID.SymbolSet_SignalsIntelligence_Air: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processAirSpaceUnitTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processAirSpaceUnitTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_SignalsIntelligence_Space: {
                        if (ver < SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processAirSpaceUnitTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else//SIGINT in 2525E+ uses modifer places based on frame shape
                        {
                            let frameShape: string = SymbolID.getFrameShape(symbolID);
                            if (frameShape === SymbolID.FrameShape_Space || frameShape === SymbolID.FrameShape_Air) {

                                newSDI = ModifierRenderer.processAirSpaceUnitTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                            }

                            else {
                                if (frameShape === SymbolID.FrameShape_LandEquipment_SeaSurface) {
                                    //sea surface, but can't tell which so default land equip
                                    newSDI = ModifierRenderer.processLandEquipmentTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                                }

                                else {
                                    if (frameShape === SymbolID.FrameShape_SeaSubsurface) {

                                        newSDI = ModifierRenderer.processSeaSubSurfaceTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                                    }

                                    else {
                                        //default land equipment
                                        newSDI = ModifierRenderer.processLandEquipmentTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                                    }

                                }

                            }

                        }
                        break;
                    }

                    case SymbolID.SymbolSet_SeaSurface:
                    case SymbolID.SymbolSet_SignalsIntelligence_SeaSurface: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processSeaSurfaceTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processSeaSurfaceTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_SeaSubsurface:
                    case SymbolID.SymbolSet_SignalsIntelligence_SeaSubsurface: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processSeaSubSurfaceTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processSeaSubSurfaceTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_Activities: {
                        if (ver >= SymbolID.Version_2525E) {

                            newSDI = ModifierRenderer.processActivitiesTextModifiersE(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        else {

                            newSDI = ModifierRenderer.processActivitiesTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        }

                        break;
                    }

                    case SymbolID.SymbolSet_CyberSpace: {
                        newSDI = ModifierRenderer.processCyberSpaceTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                        break;
                    }

                    case SymbolID.SymbolSet_MineWarfare: {
                        break;
                    }
                    //no modifiers
                    case SymbolID.SymbolSet_Unknown:
                    default: { //in theory, will never get here
                        newSDI = ModifierRenderer.processUnknownTextModifiers(si, symbolID, modifiers, attributes, this._fontRenderContext);
                    }

                }

            }

            if (newSDI != null) {
                si = newSDI as SVGSymbolInfo;
            }
            newSDI = null;//*/

            let widthOffset: int = 0;
            if (hasTextModifiers) {

                widthOffset = 2;
            }
            //add for the text outline

            let svgWidth: int = (si.getImageBounds().getWidth() + widthOffset) as int;
            let svgHeight: int = si.getImageBounds().getHeight() as int;
            //add SVG tag with dimensions
            //draw unit from SVG
            let svgAlpha: string = "";
            if (alpha >= 0 && alpha <= 255) {

                svgAlpha = " opacity=\"" + alpha / 255 + "\"";
            }

            svgStart = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"" + svgWidth + "\" height=\"" + svgHeight + "\" viewBox=\"" + 0 + " " + 0 + " " + svgWidth + " " + svgHeight + "\"" + svgAlpha + ">\n";
            let svgTranslateGroup: string;

            let transX: double = si.getImageBounds().getX() * -1;
            let transY: double = si.getImageBounds().getY() * -1;
            let anchor: Point2D = si.getSymbolCenterPoint();
            let imageBounds: Rectangle2D = si.getImageBounds();
            if (transX > 0 || transY > 0) {
                ShapeUtilities.offset(anchor, transX, transY);
                ShapeUtilities.offset(symbolBounds, transX, transY);
                ShapeUtilities.offset(imageBounds, transX, transY);
                svgTranslateGroup = "<g transform=\"translate(" + transX + "," + transY + ")" + "\">\n";
            }
            imageBounds.setRect(imageBounds.getX(), imageBounds.getY(), svgWidth, svgHeight);
            si = new SVGSymbolInfo(si.getSVG(), anchor, symbolBounds, imageBounds);
            let sbSVG:string =  "";
            sbSVG += (svgStart);
            sbSVG += (this.makeDescTag(si));
            sbSVG += (this.makeMetadataTag(symbolID, si));
            if (svgTranslateGroup != null) {

                sbSVG += (svgTranslateGroup);
            }

            sbSVG += (si.getSVG());
            if (svgTranslateGroup != null) {

                sbSVG += ("\n</g>");
            }

            sbSVG += ("\n</svg>");
            si = new SVGSymbolInfo(sbSVG.toString().valueOf(), anchor, symbolBounds, imageBounds);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("SinglePointRenderer", "renderUnit", exc);
            } else {
                throw exc;
            }
        }

        return si;
    }

    public RenderSP(symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>): SVGSymbolInfo | null {
        let si: SVGSymbolInfo = null;

        let pixelSize: int = 50;
        let scale: double = 1.0;
        let lineColor: string = null;//SymbolUtilitiesD.getLineColorOfAffiliation(symbolID);
        let fillColor: string = null;
        let alpha: float = -1;

        let keepUnitRatio: boolean = true;
        let asIcon: boolean = false;
        let hasDisplayModifiers: boolean = false;
        let hasTextModifiers: boolean = false;
        let outlineSymbol: boolean = false;

        //SVG rendering variables
        let msi: MSInfo = null;
        let iconID: string = null;
        let siIcon: SVGInfo = null;
        let mod1ID: string = null;
        let siMod1: SVGInfo = null;
        let top: int = 0;
        let left: int = 0;
        let width: int = 0;
        let height: int = 0;
        let svgStart: string = null;
        let strSVG: string = null;

        let ratio: double = 0;

        let symbolBounds: Rectangle2D = null;
        let fullBounds: Rectangle2D = null;
        let fullBMP: ImageBitmap = null;


        let ii: ImageInfo;
        let drawRule: int = 0;

        try {
            msi = MSLookup.getInstance().getMSLInfo(symbolID);

            let ss: int = SymbolID.getSymbolSet(symbolID);
            let ec: int = SymbolID.getEntityCode(symbolID);
            let mod1: int = 0;
            
            let hasAPFill: boolean = false;
            if (msi != null) { drawRule = msi.getDrawRule(); }
            if (SymbolUtilities.isActionPoint(symbolID) || //action points
                drawRule === DrawRules.POINT10 || //Sonobuoy
                ec === 180100 || ec === 180200 || ec === 180400) //ACP, CCP, PUP
            {
                if (SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_ControlMeasure) {
                    lineColor = "#000000";
                    hasAPFill = true;
                }
            }
            if (lineColor == null) {

                lineColor = RendererUtilities.colorToHexString(SymbolUtilities.getDefaultLineColor(symbolID), false);
            }


            //fillColor = "#FF0000";
            //stroke-opacity
            //fill-opacity="0.4"
            //opacity
            if (attributes != null) {
                if (attributes.has(MilStdAttributes.PixelSize)) {

                    pixelSize = parseInt(attributes.get(MilStdAttributes.PixelSize));
                }

                if (attributes.has(MilStdAttributes.LineColor)) {

                    lineColor = attributes.get(MilStdAttributes.LineColor);
                }

                if (attributes.has(MilStdAttributes.FillColor)) {

                    fillColor = attributes.get(MilStdAttributes.FillColor);
                }

                if (attributes.has(MilStdAttributes.Alpha)) {

                    alpha = parseInt(attributes.get(MilStdAttributes.Alpha));
                }

                if (attributes.has(MilStdAttributes.DrawAsIcon)) {

                    asIcon = attributes.get(MilStdAttributes.DrawAsIcon).toLowerCase() === 'true';
                }

                if (attributes.has(MilStdAttributes.KeepUnitRatio)) {

                    keepUnitRatio = attributes.get(MilStdAttributes.KeepUnitRatio).toLowerCase() === 'true';
                }


                if (asIcon === false)//don't outline icons because they're not going on the map
                {
                    if (attributes.has(MilStdAttributes.OutlineSymbol)) {

                        outlineSymbol = attributes.get(MilStdAttributes.OutlineSymbol).toLowerCase() === 'true';
                    }

                    else {

                        outlineSymbol = RendererSettings.getInstance().getOutlineSPControlMeasures();
                    }

                }

                if (SymbolUtilities.isMultiPoint(symbolID)) {

                    outlineSymbol = false;
                }
                //icon previews for multipoints do not need outlines since they shouldn't be on the map

            }

            if (keepUnitRatio) {
                pixelSize = Math.ceil((pixelSize / 1.5) * 1.75) as int;
            }




            if (ss === SymbolID.SymbolSet_ControlMeasure && ec === 270701)//static depiction
            {
                //add mine fill to image
                mod1 = SymbolID.getModifier1(symbolID);
                if (!(mod1 >= 13 && mod1 <= 50)) {

                    symbolID = SymbolID.setModifier1(symbolID, 13);
                }

            }

            //String key = makeCacheKey(symbolID, lineColor, fillColor, pixelSize, keepUnitRatio, outlineSymbol);;
            //see if it's in the cache
            /*if(_tgCache != null)
             {
             ii = _tgCache[key];
             }//*/


            //if not, generate symbol.
            if (si == null)//*/
            {
                let version: int = SymbolID.getVersion(symbolID);
                //check symbol size////////////////////////////////////////////
                let rect: Rectangle2D;
                iconID = SVGLookup.getMainIconID(symbolID);
                siIcon = SVGLookup.getInstance().getSVGLInfo(iconID, version);
                mod1ID = SVGLookup.getMod1ID(symbolID);
                siMod1 = SVGLookup.getInstance().getSVGLInfo(mod1ID, version);
                let borderPadding: float = 0;
                if (outlineSymbol && siIcon != null) 
                {
                    borderPadding = RendererUtilities.findWidestStrokeWidth(siIcon.getSVG());
                }
                top = Math.round(siIcon.getBbox().getY()) as int;
                left = Math.round(siIcon.getBbox().getX()) as int;
                width = Math.round(siIcon.getBbox().getWidth()) as int;
                height = Math.round(siIcon.getBbox().getHeight()) as int;

                let strSVGIcon: string;


                if (drawRule === DrawRules.POINT1) //action points and a few others
                {//TODO: move this stroke width adjustment to the external tool that makes 2525D.SVG & 2525E.SVG
                    siIcon = new SVGInfo(siIcon.getID(), siIcon.getBbox(), siIcon.getSVG().replaceAll("stroke-width=\"4\"", "stroke-width=\"6\""));
                }
                if (hasAPFill) //Action Point(s), Sonobuoys, ACP, CCP, PUP
                {
                    let apFill: string;
                    if (fillColor != null) {

                        apFill = fillColor;
                    }

                    else {

                        apFill = RendererUtilities.colorToHexString(SymbolUtilities.getFillColorOfAffiliation(symbolID), false);
                    }

                    siIcon = new SVGInfo(siIcon.getID(), siIcon.getBbox(), siIcon.getSVG().replaceAll("fill=\"none\"", "fill=\"" + apFill + "\""));
                }

                //update line and fill color of frame SVG
                if (msi.getSymbolSet() === SymbolID.SymbolSet_ControlMeasure && (lineColor != null || fillColor != null)) {
                    if (outlineSymbol) {
                        // create outline with larger stroke-width first (if selected)
                        strSVGIcon = RendererUtilities.setSVGSPCMColors(symbolID, siIcon.getSVG(), RendererUtilities.getIdealOutlineColor(RendererUtilities.getColorFromHexString(lineColor)), RendererUtilities.getColorFromHexString(fillColor), true);
                    }
                    else {

                        strSVGIcon = "";
                    }


                    // append normal symbol SVG to be layered on top of outline
                    strSVGIcon += RendererUtilities.setSVGSPCMColors(symbolID, siIcon.getSVG(), RendererUtilities.getColorFromHexString(lineColor), RendererUtilities.getColorFromHexString(fillColor), false);
                }
                else {
                    //weather symbol (don't change color of weather graphics)
                    strSVGIcon = siIcon.getSVG();
                }


                //If symbol is Static Depiction, add internal mine graphic based on sector modifier 1
                if (SymbolID.getEntityCode(symbolID) === 270701 && siMod1 != null) {
                    if (outlineSymbol) {
                        // create outline with larger stroke-width first (if selected)
                        strSVGIcon += RendererUtilities.setSVGSPCMColors(mod1ID, siMod1.getSVG(), RendererUtilities.getIdealOutlineColor(RendererUtilities.getColorFromHexString("#00A651")), RendererUtilities.getColorFromHexString("#00A651"), true);
                    }
                    //strSVGIcon += siMod1.getSVG();
                    strSVGIcon += RendererUtilities.setSVGSPCMColors(mod1ID, siMod1.getSVG(), RendererUtilities.getColorFromHexString(lineColor), RendererUtilities.getColorFromHexString(fillColor), false);
                }

                if (pixelSize > 0) {
                    symbolBounds = RectUtilities.toRectangle2D(left, top, width, height);//actual measurement of symbol svg
                    rect = RectUtilities.copyRect(symbolBounds);

                    //adjust size
                    let p: float = pixelSize;
                    let h: double = rect.getHeight();
                    let w: double = rect.getWidth();

                    ratio = Math.min((p / h), (p / w));

                    //measurement of target size/location of symbol after being translated/scaled into the new SVG
                    symbolBounds = RectUtilities.toRectangle2D(0, 0, w * ratio, h * ratio);//.makeRect(0f, 0f, w * ratio, h * ratio);

                    //make sure border padding isn't excessive.
                    w = symbolBounds.getWidth();
                    h = symbolBounds.getHeight();

                    if (borderPadding > (h * 0.1)) {
                        borderPadding = (h * 0.1) as float;
                    }
                    else {
                        if (borderPadding > (w * 0.1)) {
                            borderPadding = (w * 0.1) as float;
                        }
                    }
                    //*/

                }

                let borderPaddingBounds: Rectangle2D;
                let offset: int = 0;
                if (msi.getSymbolSet() === SymbolID.SymbolSet_ControlMeasure && outlineSymbol && borderPadding !== 0) {
                    borderPaddingBounds = RectUtilities.toRectangle2D(0, 0, (rect.getWidth() + (borderPadding)) * ratio, (rect.getHeight() + (borderPadding)) * ratio);//.makeRect(0f, 0f, w * ratio, h * ratio);
                    symbolBounds = borderPaddingBounds;

                    //grow size SVG to accommodate the outline we added
                    offset = borderPadding as int / 2;//4;
                    RectUtilities.grow(rect, offset);

                }

                let strLineJoin: string = "";

                if (msi.getSymbolSet() === SymbolID.SymbolSet_ControlMeasure && msi.getDrawRule() === DrawRules.POINT1) {
                    //smooth out action points
                    strLineJoin = " stroke-linejoin=\"round\" ";
                }


                let sbGroupUnit:string = "";
                if (siIcon != null) {
                    sbGroupUnit += ("<g transform=\"translate(" + (rect.getX() * -ratio) + ',' + (rect.getY() * -ratio) + ") scale(" + ratio + "," + ratio + ")\"" + strLineJoin + ">");
                    sbGroupUnit += (strSVGIcon);//(siIcon.getSVG());
                    sbGroupUnit += ("</g>");
                }

                //Point centerPoint = SymbolUtilities.getCMSymbolAnchorPoint(symbolID, RectUtilities.makeRectangle2DFromRect(offset, offset, symbolBounds.getWidth()-offset, symbolBounds.getHeight()-offset));
                let centerPoint: Point = SymbolUtilities.getCMSymbolAnchorPoint(symbolID, RectUtilities.makeRectangle2DFromRect(0, 0, symbolBounds.getWidth(), symbolBounds.getHeight()));

                /*if (borderPaddingBounds != null) {
                    RectUtilities.grow(symbolBounds, 4);
                }//*/

                si = new SVGSymbolInfo(sbGroupUnit.toString().valueOf(), centerPoint.toPoint2D(), symbolBounds, symbolBounds);

            }

            let siNew: SVGSymbolInfo = null;

            ////////////////////////////////////////////////////////////////////
            hasDisplayModifiers = ModifierRenderer.hasDisplayModifiers(symbolID, modifiers);
            hasTextModifiers = ModifierRenderer.hasTextModifiers(symbolID, modifiers);


            if (SymbolUtilities.isMultiPoint(symbolID)) {
                hasTextModifiers = false;
                hasDisplayModifiers = false;
            }
            //process display modifiers
            if (asIcon === false && (hasTextModifiers || hasDisplayModifiers)) {
                let sdiTemp: SymbolDimensionInfo;
                let cLineColor: Color = RendererUtilities.getColorFromHexString(lineColor);

                if (SymbolUtilities.isSPWithSpecialModifierLayout(symbolID))//(SymbolUtilitiesD.isTGSPWithSpecialModifierLayout(symbolID))
                {
                    sdiTemp = ModifierRenderer.ProcessTGSPWithSpecialModifierLayout(si, symbolID, modifiers, attributes, cLineColor, this._fontRenderContext);
                }
                else {
                    sdiTemp = ModifierRenderer.ProcessTGSPModifiers(si, symbolID, modifiers, attributes, cLineColor, this._fontRenderContext);
                }
                siNew = (sdiTemp instanceof SVGSymbolInfo ? sdiTemp as SVGSymbolInfo : null);
            }

            if (siNew != null) {
                si = siNew;
            }
            siNew = null;


            //add SVG tag with dimensions
            //draw unit from SVG
            let svgAlpha: string = "";
            if (alpha >= 0 && alpha <= 255) {

                svgAlpha = " opacity=\"" + alpha / 255 + "\"";
            }

            svgStart = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"" + si.getImageBounds().getWidth() + "\" height=\"" + si.getImageBounds().getHeight() + "\" viewBox=\"" + 0 + " " + 0 + " " + si.getImageBounds().getWidth() + " " + si.getImageBounds().getHeight() + "\"" + svgAlpha + ">\n";
            let svgTranslateGroup: string;

            let transX: double = si.getImageBounds().getX() * -1;
            let transY: double = si.getImageBounds().getY() * -1;
            let anchor: Point2D = si.getSymbolCenterPoint();
            let imageBounds: Rectangle2D = si.getImageBounds();
            if (transX > 0 || transY > 0) {
                ShapeUtilities.offset(anchor, transX, transY);
                ShapeUtilities.offset(symbolBounds, transX, transY);
                ShapeUtilities.offset(imageBounds, transX, transY);
                svgTranslateGroup = "<g transform=\"translate(" + transX + "," + transY + ")" + "\">\n";
            }
            si = new SVGSymbolInfo(si.getSVG(), anchor, symbolBounds, imageBounds);
            let sbSVG:string = "";
            sbSVG += (svgStart);
            sbSVG += (this.makeDescTag(si));
            sbSVG += (this.makeMetadataTag(symbolID, si));
            if (svgTranslateGroup != null) {

                sbSVG += (svgTranslateGroup);
            }

            sbSVG += (si.getSVG());
            if (svgTranslateGroup != null) {

                sbSVG += ("\n</g>");
            }

            sbSVG += ("\n</svg>");
            si = new SVGSymbolInfo(sbSVG.toString().valueOf(), anchor, symbolBounds, imageBounds);


        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("MilStdIconRenderer", "RenderSP", exc);
                ErrorLogger.LogMessage(" SymbolID: " + symbolID);
                return null;
            } else {
                throw exc;
            }
        }
        return si;
    }

    /**
     * 
     * @param symbolID 
     * @param attributes 
     * @returns 
     */
    public RenderModifier(symbolID:string, attributes:Map<string,string>):SVGSymbolInfo
    {
        let temp:SVGSymbolInfo = null;
        let basicSymbolID:string = null;

        let lineColor:string = null;
        let fillColor:string = null;//SymbolUtilities.getFillColorOfAffiliation(symbolID);

        let alpha:number = -1;


        //SVG rendering variables
        let msi:MSInfo = null;
        let iconID:string = null;
        let siIcon:SVGInfo = null;
        let top:number = 0;
        let left:number = 0;
        let width:number = 0;
        let height:number = 0;
        let svgStart:string = null;
        let strSVG:string = null;

        let ratio:number = 0;

        let symbolBounds:Rectangle2D = null;
        let fullBounds:Rectangle2D = null;

        let drawAsIcon:boolean = false;
        let pixelSize:number = -1;
        let keepUnitRatio:boolean = true;
        let hasDisplayModifiers:boolean = false;
        let hasTextModifiers:boolean = false;
        let drawCustomOutline:boolean = false;

        try
        {

            msi = MSLookup.getInstance().getMSLInfo(symbolID);
            //Get Attributes
            if (attributes != null)
            {
                /*if (attributes.containsKey(MilStdAttributes.KeepUnitRatio))
                {
                    keepUnitRatio = Boolean.parseBoolean(attributes.get(MilStdAttributes.KeepUnitRatio));
                }*/

                lineColor = RendererUtilities.colorToHexString(SymbolUtilities.getLineColorOfAffiliation(symbolID), false);
                if (attributes.has(MilStdAttributes.LineColor))
                {
                    lineColor = attributes.get(MilStdAttributes.LineColor);
                }

                if (attributes.has(MilStdAttributes.FillColor))
                {
                    fillColor = attributes.get(MilStdAttributes.FillColor);
                }

                if (attributes.has(MilStdAttributes.Alpha))
                {
                    alpha = parseInt(attributes.get(MilStdAttributes.Alpha));
                }

                if (attributes.has(MilStdAttributes.DrawAsIcon))
                {
                    drawAsIcon = (attributes.get(MilStdAttributes.DrawAsIcon).toLowerCase()==='true');
                }

                if (attributes.has(MilStdAttributes.PixelSize))
                {
                    pixelSize = parseInt(attributes.get(MilStdAttributes.PixelSize));
                    if(msi.getSymbolSet() == SymbolID.SymbolSet_ControlMeasure)
                    {
                        if(SymbolID.getEntityCode(symbolID)==270701)//static depiction
                            pixelSize = Math.floor(pixelSize * 0.9);//try to scale to be somewhat in line with units
                    }
                }

            }

            if(drawAsIcon==false)//don't outline icons because they're not going on the map
            {
                if(attributes.has(MilStdAttributes.OutlineSymbol))
                    drawCustomOutline = (attributes.get(MilStdAttributes.OutlineSymbol).toLowerCase()==='true');
                else
                    drawCustomOutline = RendererSettings.getInstance().getOutlineSPControlMeasures();
            }
        }
        catch (e)
        {
            ErrorLogger.LogException("MilStdIconRenderer", "RenderModifier2-Getting Attributes", e);
        }

        try
        {
            let ii:SVGSymbolInfo = null;

            let version:number = SymbolID.getVersion(symbolID);
            //check symbol size////////////////////////////////////////////
            let rect:Rectangle2D = null;

            iconID = SVGLookup.getMod1ID(symbolID);
            siIcon = SVGLookup.getInstance().getSVGLInfo(iconID, version);
            top = Math.round(siIcon.getBbox().getY());
            left = Math.round(siIcon.getBbox().getX());
            width = Math.round(siIcon.getBbox().getWidth());
            height = Math.round(siIcon.getBbox().getHeight());

            let strSVGIcon:string = "";
            let strSVGOutline:string = null;

            if(msi.getSymbolSet() == SymbolID.SymbolSet_ControlMeasure && (lineColor != null || fillColor != null))
            {
                if(drawCustomOutline)
                    strSVGIcon += RendererUtilities.setSVGSPCMColors(iconID,siIcon.getSVG(), RendererUtilities.getIdealOutlineColor(RendererUtilities.getColorFromHexString(lineColor)), RendererUtilities.getColorFromHexString(fillColor),true);
                strSVGIcon += RendererUtilities.setSVGSPCMColors(iconID, siIcon.getSVG(), RendererUtilities.getColorFromHexString(lineColor), RendererUtilities.getColorFromHexString(fillColor));
            }
            else
                strSVGIcon = siIcon.getSVG();

            if (pixelSize > 0)
            {
                symbolBounds = RectUtilities.toRectangle2D(left,top,width,height);
                rect = RectUtilities.copyRect(symbolBounds);

                //adjust size
                let p:number = pixelSize;
                let h:number = rect.getHeight();
                let w:number = rect.getWidth();

                ratio = Math.min((p / h), (p / w));

                symbolBounds = RectUtilities.makeRectangle2DFromRect(0, 0, w * ratio, h * ratio);

            }


            //grow size SVG to accommodate the outline we added
            let offset:number = 0;
            if(drawCustomOutline) {
                RectUtilities.grow(rect, 3);
                offset = 3;
            }

            //Draw glyphs to bitmap
            let bmp:Rectangle2D;//let bmp:OffscreenCanvas;
            if(keepUnitRatio) //icons are sized with respect to each other so growing bmp to fit outline isn't a big deal
            {
                bmp = new Rectangle2D(0,0,Math.floor(symbolBounds.getWidth() + (offset * 2)), Math.floor(symbolBounds.getHeight() + (offset * 2)));
            }
            else //try to stay within the confines of the pixelSize as "keepUnitRatio==false" means the user wants to stay within the set pixelSize
            {
                bmp = new Rectangle2D(0,0,Math.floor(symbolBounds.getWidth()), Math.floor(symbolBounds.getHeight()));
            }


            symbolBounds = RectUtilities.makeRectangle2DFromRect(offset, offset, bmp.width-offset, bmp.height-offset);

            svgStart = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"" + bmp.getX() + " " + bmp.getY() + " " + bmp.getWidth() + " " + bmp.getHeight() + "\" width=\"" + bmp.getWidth() + "\" height=\"" + bmp.getHeight() + "\">";

            let sbGroupUnit:string = ("<g transform=\"translate(" + ((siIcon.getBbox().getX() * -ratio) + offset) + ',' + ((siIcon.getBbox().getY() * -ratio)+offset) + ") scale(" + ratio + "," + ratio + ")\"" + ">");

            strSVG = svgStart + sbGroupUnit + strSVGIcon + "</g></svg>";


            let centerPoint:Point = SymbolUtilities.getCMSymbolAnchorPoint(symbolID,RectUtilities.toRectangle2D(offset, offset, symbolBounds.getWidth(), symbolBounds.getHeight()));

            ii = new SVGSymbolInfo(strSVG, centerPoint.toPoint2D(), symbolBounds,symbolBounds);

            //cleanup
            //bmp.recycle();
            symbolBounds = null;
            fullBounds = null;

            return ii;
        }
        catch (e)
        {
            ErrorLogger.LogException("MilStdIconRenderer", "RenderSP", e);
        }
        return null;
    }

    /**
     * 
     * @param si 
     * @returns 
     */
    private makeDescTag(si: SVGSymbolInfo): string {
        let sbDesc:string = "";

        if (si != null) {
            let bounds: Rectangle2D = si.getSymbolBounds();
            let iBounds: Rectangle2D = si.getImageBounds();
            sbDesc += ("<desc>") + (si.getSymbolCenterX()) + (" ") + (si.getSymbolCenterY()) + (" ");
            sbDesc += (bounds.getX()) + (" ") + (bounds.getY()) + (" ") + (bounds.getWidth()) + (" ") + (bounds.getHeight()) + (" ");
            sbDesc += (iBounds.getX()) + (" ") + (iBounds.getY()) + (" ") + (iBounds.getWidth()) + (" ") + (iBounds.getHeight());
            sbDesc += ("</desc>\n");
        }
        return sbDesc.toString().valueOf();
    }

    /**
     * 
     * @param symbolID 
     * @param si 
     * @returns 
     */
    private makeMetadataTag(symbolID: string, si: SVGSymbolInfo): string {
        let sbDesc:string = "";

        if (si != null) {
            let bounds: Rectangle2D = si.getSymbolBounds();
            let iBounds: Rectangle2D = si.getImageBounds();
            sbDesc += ("<metadata>\n");
            sbDesc += ("<symbolID>") + (symbolID) + ("</symbolID>\n");
            sbDesc += ("<anchor>") + (si.getSymbolCenterX()) + (" ") + (si.getSymbolCenterY()) + ("</anchor>\n");
            sbDesc += ("<symbolBounds>") + (bounds.getX()) + (" ") + (bounds.getY()) + (" ") + (bounds.getWidth()) + (" ") + (bounds.getHeight()) + ("</symbolBounds>\n");
            sbDesc += ("<imageBounds>") + (iBounds.getX()) + (" ") + (iBounds.getY()) + (" ") + (iBounds.getWidth()) + (" ") + (iBounds.getHeight()) + ("</imageBounds>\n");;
            sbDesc += ("</metadata>\n");
        }
        return sbDesc.toString().valueOf();
    }

    private getSVGString(symbolID: string, isOutline: boolean): string {
        let version: int = SymbolID.getVersion(symbolID);
        let svgi: SVGInfo = SVGLookup.getInstance().getSVGLInfo(SymbolUtilities.getBasicSymbolID(symbolID), version);

        let strSVG: string = svgi.getSVG();
        if (isOutline) {

            strSVG = strSVG.replace("<g id=\"" + SymbolUtilities.getBasicSymbolID(symbolID) + "\">", "<g id=\"" + SymbolUtilities.getBasicSymbolID(symbolID) + "_outline\">");
        }


        let svgStart: string;
        if (svgi.getBbox().getMaxY() > 400) {

            svgStart = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 612 792\">";
        }

        else {

            svgStart = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 400 400\">";
        }


        strSVG = svgStart + strSVG + "</svg>";

        return strSVG;

    }

}
