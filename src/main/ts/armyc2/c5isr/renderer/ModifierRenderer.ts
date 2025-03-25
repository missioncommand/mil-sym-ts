



import { type float, type int, type double } from "../graphics2d/BasicTypes";

//Graphics2D
import { AffineTransform } from "../graphics2d/AffineTransform"
import { BasicStroke } from "../graphics2d/BasicStroke"
import { Font } from "../graphics2d/Font"
import { FontMetrics } from "../graphics2d/FontMetrics"
import { FontRenderContext } from "../graphics2d/FontRenderContext"
import { Graphics2D } from "../graphics2d/Graphics2D"
import { Line2D } from "../graphics2d/Line2D"
import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
//import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { TextLayout } from "../graphics2d/TextLayout"

//Renderer/Shapes
//import { Point } from "./shapes/point";
import { Rectangle } from "./shapes/rectangle";
import { Line } from "./shapes/line";
import { Ellipse } from "./shapes/ellipse";
import { RoundedRectangle } from "./shapes/roundedrectangle";
import { Path } from "./shapes/path";
import { BCurve } from "./shapes/bcurve";
import { Arc } from "./shapes/arc";

//Renderer.Utilities
import { Color } from "../renderer/utilities/Color"
import { GENCLookup } from "../renderer/utilities/GENCLookup"
import { ImageInfo } from "../renderer/utilities/ImageInfo"
import { MilStdAttributes } from "../renderer/utilities/MilStdAttributes"
import { Modifiers } from "../renderer/utilities/Modifiers"
import { MSInfo } from "../renderer/utilities/MSInfo"
import { MSLookup } from "../renderer/utilities/MSLookup"
import { RectUtilities } from "../renderer/utilities/RectUtilities"
import { RendererSettings } from "../renderer/utilities/RendererSettings"
import { RendererUtilities } from "../renderer/utilities/RendererUtilities"
import { SettingsChangedEvent } from "../renderer/utilities/SettingsChangedEvent"
//import { SettingsChangedEventListener } from "../renderer/utilities/SettingsChangedEventListener"
import { SettingsEventListener } from "../renderer/utilities/SettingsEventListener"
import { Shape2SVG } from "../renderer/utilities/Shape2SVG"
import { SVGSymbolInfo } from "../renderer/utilities/SVGSymbolInfo"
import { SymbolDimensionInfo } from "../renderer/utilities/SymbolDimensionInfo"
import { SymbolID } from "../renderer/utilities/SymbolID"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"
import { TextInfo } from "../renderer/utilities/TextInfo"
import { ShapeUtilities } from "./utilities/ShapeUtilities";
import { SVGTextInfo } from "./utilities/SVGTextInfo";
import { ShapeTypes } from "./shapes/types";



/**
 * This class is used for rendering the labels/amplifiers/modifiers around the single point symbol.
 */
export class ModifierRenderer implements SettingsEventListener {

    private static _instance: ModifierRenderer;
    private static _className: string = "ModifierRenderer";
    private static RS: RendererSettings = RendererSettings.getInstance();
    private static _modifierFont: Font = ModifierRenderer.RS.getLabelFont();

    private static _modifierFontHeight: float = 11;
    private static _modifierFontDescent: float = 2;


    private static _bmp: OffscreenCanvas = new OffscreenCanvas(2, 2);
    private static _frc: OffscreenCanvasRenderingContext2D = this._bmp.getContext("2d");



    /*public onSettingsChanged(sce: SettingsChangedEvent): void {


        if (sce != null && sce.getEventType() === (SettingsChangedEvent.EventType_FontChanged)) {
            ModifierRenderer._modifierFont = RendererSettings.getInstance().getLabelFont();
            ModifierRenderer._frc.font = ModifierRenderer._modifierFont.toString();

            let tm: TextMetrics = ModifierRenderer._frc.measureText("Hj");

            ModifierRenderer._modifierFontHeight = tm.fontBoundingBoxAscent;//fm.getHeight();
            ModifierRenderer._modifierFontDescent = tm.fontBoundingBoxDescent;//fm.getMaxDescent();
        }
    }//*/

    public SettingsEventChanged(type: string): void {
        if (type === (SettingsChangedEvent.EventType_FontChanged)) {
            ModifierRenderer._modifierFont = RendererSettings.getInstance().getLabelFont();
            ModifierRenderer._frc.font = ModifierRenderer._modifierFont.toString();

            let tm: TextMetrics = ModifierRenderer._frc.measureText("Hj");

            ModifierRenderer._modifierFontHeight = tm.fontBoundingBoxAscent;//fm.getHeight();
            ModifierRenderer._modifierFontDescent = tm.fontBoundingBoxDescent;//fm.getMaxDescent();
        }
    }

    private constructor() 
    {

    }

    /**
     * Instance of the ModifierRenderer class
     * @return the instance
     */
    public static getInstance(): ModifierRenderer {
        if (!ModifierRenderer._instance) {

            ModifierRenderer._instance = new ModifierRenderer();
            RendererSettings.getInstance().addEventListener(ModifierRenderer._instance);
            ModifierRenderer._instance.SettingsEventChanged(SettingsChangedEvent.EventType_FontChanged);
        }

        return ModifierRenderer._instance;
    }


    public static processUnitDisplayModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo | null {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;
        let newsdi: SymbolDimensionInfo;
        let symbolBounds: Rectangle2D = sdi.getSymbolBounds().clone() as Rectangle2D;
        let imageBounds: Rectangle2D = sdi.getImageBounds();
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let symbolCenter: Point2D = new Point2D(symbolBounds.getCenterX(), symbolBounds.getCenterY());
        let stiEchelon: SVGTextInfo;
        let stiAM: SVGTextInfo;
        let echelonBounds: Rectangle2D;
        let amBounds: Rectangle2D;
        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;
        let strokeWidth: float = 3.0;
        let strokeWidthNL: float = 3.0;
        let lineColor: Color = Color.BLACK;//SymbolUtilities.getLineColorOfAffiliation(symbolID);
        let fillColor: Color = SymbolUtilities.getFillColorOfAffiliation(symbolID);
        let buffer: int = 0;
        let alpha: float = -1;
        //ctx = null;
        let offsetX: int = 0;
        let offsetY: int = 0;
        let pixelSize: int = RendererSettings.getInstance().getDefaultPixelSize();

        let ss: int = SymbolID.getSymbolSet(symbolID);

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }
        if (attributes.has(MilStdAttributes.TextColor)) {
            textColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextColor));
        }
        if (attributes.has(MilStdAttributes.TextBackgroundColor)) {
            textBackgroundColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextBackgroundColor));
        }
        else {
            textBackgroundColor = RendererUtilities.getIdealOutlineColor(textColor);
        }
        if (attributes.has(MilStdAttributes.LineColor)) {
            lineColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.LineColor));
        }
        if (attributes.has(MilStdAttributes.FillColor)) {
            fillColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.FillColor));
        }
        if (attributes.has(MilStdAttributes.PixelSize)) {
            pixelSize = parseInt(attributes.get(MilStdAttributes.PixelSize));
        }

        if (pixelSize <= 100) {

            strokeWidth = 2.0;
        }

        else {

            strokeWidth = 2 + ((pixelSize - 100) / 100);
        }


        // <editor-fold defaultstate="collapsed" desc="Build Mobility Modifiers">
        let mobilityBounds: Rectangle;
        let ad: int = SymbolID.getAmplifierDescriptor(symbolID);//echelon/mobility

        //let mobilityPath: Path2D;
        //let mobilityPathFill: Path2D;

        let mobilityPath: Array<any> = new Array<any>();
        let mobilityPathFill: Array<any> = new Array<any>();

        if (ad >= SymbolID.Mobility_WheeledLimitedCrossCountry &&
            (SymbolUtilities.hasModifier(symbolID, Modifiers.R_MOBILITY_INDICATOR) ||
                SymbolUtilities.hasModifier(symbolID, Modifiers.AG_AUX_EQUIP_INDICATOR))) {

            //Draw Mobility
            let fifth: int = ((symbolBounds.getWidth() * 0.2) + 0.5) as int;
            let x: int = 0;
            let y: int = 0;
            let centerX: int = 0;
            let bottomY: int = 0;
            let height: int = 0;
            let width: int = 0;
            let middleY: int = 0;
            let wheelOffset: int = 2;
            let wheelSize: int = fifth;//10;
            let rrHeight: int = fifth;//10;
            let rrArcWidth: int = ((fifth * 1.5) + 0.5) as int;//16;


            x = symbolBounds.getX() as int + 1;
            y = symbolBounds.getY() as int;
            height = (symbolBounds.getHeight()) as int;
            width = Math.round(symbolBounds.getWidth()) as int - 3;
            bottomY = y + height + 3;

            let shapes: Array<any> = new Array();


            if (ad >= SymbolID.Mobility_WheeledLimitedCrossCountry && ad < SymbolID.Mobility_ShortTowedArray &&//31, mobility starts above 30
                SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.R_MOBILITY_INDICATOR)) {

                //wheelSize = width / 7;
                //rrHeight = width / 7;
                //rrArcWidth = width / 7;
                if (ad === SymbolID.Mobility_WheeledLimitedCrossCountry)//MO
                {
                    //line
                    mobilityPath.push(new Line(x, bottomY, x + width, bottomY));
                    //left circle
                    mobilityPath.push(new Ellipse(x, bottomY + wheelOffset, wheelSize, wheelSize));
                    //right circle
                    mobilityPath.push(new Ellipse(x + width - wheelSize, bottomY + wheelOffset, wheelSize, wheelSize));
                }
                else if (ad === SymbolID.Mobility_WheeledCrossCountry)//MP
                {
                    //line
                    mobilityPath.push(new Line(x, bottomY, x + width, bottomY));
                    //left circle
                    mobilityPath.push(new Ellipse(x, bottomY + wheelOffset, wheelSize, wheelSize));
                    //right circle
                    mobilityPath.push(new Ellipse(x + width - wheelSize, bottomY + wheelOffset, wheelSize, wheelSize));
                    //center wheel
                    mobilityPath.push(new Ellipse(x + (width / 2) - (wheelSize / 2), bottomY + wheelOffset, wheelSize, wheelSize));
                }
                else if (ad === SymbolID.Mobility_Tracked)//MQ
                {
                    //round rectangle
                    mobilityPath.push(new RoundedRectangle(x, bottomY, width, rrHeight, (rrHeight/3) * 2));

                }
                else if (ad === SymbolID.Mobility_Wheeled_Tracked)//MR
                {
                    //round rectangle
                    mobilityPath.push(new RoundedRectangle(x, bottomY, width, rrHeight, (rrHeight/3) * 2));
                    //left circle
                    mobilityPath.push(new Ellipse(x - wheelSize - (wheelSize/3), bottomY, wheelSize, wheelSize));
                }
                else if (ad === SymbolID.Mobility_Towed)//MS
                {
                    //line
                    mobilityPath.push(new Line(x + wheelSize, bottomY + (wheelSize / 2), x + width - wheelSize, bottomY + (wheelSize / 2)));
                    //left circle
                    mobilityPath.push(new Ellipse(x, bottomY, wheelSize, wheelSize));
                    //right circle
                    mobilityPath.push(new Ellipse(x + width - wheelSize, bottomY, wheelSize, wheelSize));
                }
                else if (ad === SymbolID.Mobility_Rail)//MT
                {
                    //line
                    mobilityPath.push(new Line(x, bottomY, x + width, bottomY));
                    //left circle
                    mobilityPath.push(new Ellipse(x + wheelSize, bottomY + wheelOffset, wheelSize, wheelSize));
                    //left circle2
                    mobilityPath.push(new Ellipse(x, bottomY + wheelOffset, wheelSize, wheelSize));
                    //right circle
                    mobilityPath.push(new Ellipse(x + width - wheelSize, bottomY + wheelOffset, wheelSize, wheelSize));
                    //right circle2
                    mobilityPath.push(new Ellipse(x + width - wheelSize - wheelSize, bottomY + wheelOffset, wheelSize, wheelSize));
                }
                else if (ad === SymbolID.Mobility_OverSnow)//MU
                {
                    let muPath: Path = new Path();
                    muPath.moveTo(x, bottomY);
                    muPath.lineTo(x + 5, bottomY + 5);
                    muPath.lineTo(x + width, bottomY + 5);
                    mobilityPath.push(muPath);
                }
                else if (ad === SymbolID.Mobility_Sled)//MV
                {
                    let mvPath: Path = new Path();
                    mvPath.moveTo(x, bottomY);
                    mvPath.bezierCurveTo(x, bottomY, x - rrHeight, bottomY + rrHeight/2, x, bottomY + rrHeight);
                    mvPath.lineTo(x + width, bottomY + rrHeight);
                    mvPath.bezierCurveTo(x + width, bottomY + rrHeight, x + width + rrHeight, bottomY + rrHeight/2, x + width, bottomY);
                    mobilityPath.push(mvPath);
                }
                else if (ad === SymbolID.Mobility_PackAnimals)//MW
                {
                    let mwPath: Path = new Path();

                    centerX = Math.round(symbolBounds.getCenterX()) as int;
                    let angleWidth: int = rrHeight / 2;
                    mwPath.moveTo(centerX, bottomY + rrHeight + 2);
                    mwPath.lineTo(centerX - angleWidth, bottomY);
                    mwPath.lineTo(centerX - angleWidth * 2, bottomY + rrHeight + 2);

                    mwPath.moveTo(centerX, bottomY + rrHeight + 2);
                    mwPath.lineTo(centerX + angleWidth, bottomY);
                    mwPath.lineTo(centerX + angleWidth * 2, bottomY + rrHeight + 2);

                    mobilityPath.push(mwPath);
                }
                else if (ad === SymbolID.Mobility_Barge)//MX
                {
                    let mxPath: Path = new Path();

                    centerX = symbolBounds.getCenterX() as int;
                    let quarterX: double = (centerX - x) / 2;
                    let quarterY: double = (((bottomY + rrHeight) - bottomY) / 2);
                    mxPath.moveTo(x + width, bottomY);
                    mxPath.lineTo(x, bottomY);
                    mxPath.bezierCurveTo(x + quarterX, bottomY + rrHeight, centerX + quarterX, bottomY + rrHeight, x + width, bottomY);

                    mobilityPath.push(mxPath);
                }
                else if (ad === SymbolID.Mobility_Amphibious)//MY
                {
                    /*let incrementX: double = width / 7;
                    middleY = (((bottomY + rrHeight) - bottomY) / 2);

                    mobilityPath.append(new Arc(x, bottomY + middleY, incrementX, rrHeight, 0, 180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX, bottomY + middleY, incrementX, rrHeight, 0, -180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX * 2, bottomY + middleY, incrementX, rrHeight, 0, 180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX * 3, bottomY + middleY, incrementX, rrHeight, 0, -180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX * 4, bottomY + middleY, incrementX, rrHeight, 0, 180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX * 5, bottomY + middleY, incrementX, rrHeight, 0, -180, Arc.OPEN), false);
                    mobilityPath.append(new Arc(x + incrementX * 6, bottomY + middleY, incrementX, rrHeight, 0, 180, Arc.OPEN), false);//*/

                    let incrementX: number = width / 7;
                    let tY: number = bottomY;
                    let mY: number = (bottomY + (rrHeight / 2));
                    let bY: number = mY + (rrHeight / 2);

                    let myPath = new Path();
                    myPath.moveTo(x, mY);
                    myPath.bezierCurveTo(x, tY, x + incrementX, tY, x + incrementX, mY);
                    myPath.bezierCurveTo(x + incrementX, bY, x + incrementX * 2, bY, x + incrementX * 2, mY);
                    myPath.bezierCurveTo(x + incrementX * 2, tY, x + incrementX * 3, tY, x + incrementX * 3, mY);
                    myPath.bezierCurveTo(x + incrementX * 3, bY, x + incrementX * 4, bY, x + incrementX * 4, mY);
                    myPath.bezierCurveTo(x + incrementX * 4, tY, x + incrementX * 5, tY, x + incrementX * 5, mY);
                    myPath.bezierCurveTo(x + incrementX * 5, bY, x + incrementX * 6, bY, x + incrementX * 6, mY);
                    myPath.bezierCurveTo(x + incrementX * 6, tY, x + incrementX * 7, tY, x + incrementX * 7, mY);

                    mobilityPath.push(myPath);

                }
            }
            //Draw Towed Array Sonar
            if ((ad === SymbolID.Mobility_ShortTowedArray || ad === SymbolID.Mobility_LongTowedArray) &&
                SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.AG_AUX_EQUIP_INDICATOR)) {
                //mobilityPath = new Path();
                let boxHeight: int = ((rrHeight * 0.5) + 0.5) as int;
                if (boxHeight < 5) {

                    strokeWidthNL = 1;
                }

                bottomY = y + height + (boxHeight / 7);
                //mobilityPathFill = new Path();
                offsetY = boxHeight / 7;//1;
                centerX = symbolBounds.getCenterX() as int;
                let squareOffset: int = Math.round(boxHeight * 0.5);
                middleY = ((boxHeight / 2) + bottomY) + offsetY;//+1 for offset from symbol
                if (ad === SymbolID.Mobility_ShortTowedArray) {
                    //subtract 0.5 becase lines 1 pixel thick get aliased into
                    //a line two pixels wide.
                    //line
                    mobilityPath.push(new Line(centerX, bottomY - 1, centerX, bottomY + offsetY + boxHeight + offsetY));
                    //PathUtilties.addLine(mobilityPath, centerX - 1, bottomY - 1, centerX - 1, bottomY + boxHeight + offsetY);

                    //line
                    mobilityPath.push(new Line(x, middleY, x + width, middleY));
                    //PathUtilties.addLine(mobilityPath, x, middleY, x + width, middleY);

                    //square
                    mobilityPath.push(new Rectangle(x - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(x - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square
                    mobilityPath.push(new Rectangle(Math.round(centerX - squareOffset), bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(Math.round(centerX - squareOffset), bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square
                    mobilityPath.push(new Rectangle(x + width - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(x + width - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);
                }
                else if (ad === SymbolID.Mobility_LongTowedArray) {
                    let leftX: int = x + (centerX - x) / 2;
                    let
                        rightX: int = centerX + (x + width - centerX) / 2;

                    //line vertical left
                    mobilityPath.push(new Line(leftX, bottomY - 1, leftX, bottomY + offsetY + boxHeight + offsetY));
                    //PathUtilties.addLine(mobilityPath, leftX, bottomY - 1, leftX, bottomY + offsetY + boxHeight + offsetY);

                    //line vertical right
                    mobilityPath.push(new Line(rightX, bottomY - 1, rightX, bottomY + offsetY + boxHeight + offsetY));
                    //PathUtilties.addLine(mobilityPath, rightX, bottomY - 1, rightX, bottomY + offsetY + boxHeight + offsetY);

                    //line horizontal
                    mobilityPath.push(new Line(x, middleY, x + width, middleY));
                    //PathUtilties.addLine(mobilityPath, x, middleY, x + width, middleY);

                    //square left
                    mobilityPath.push(new Rectangle(x - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(x - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square middle
                    mobilityPath.push(new Rectangle(centerX - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(centerX - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square right
                    mobilityPath.push(new Rectangle(x + width - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(x + width - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square middle left
                    mobilityPath.push(new Rectangle(leftX - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(leftX - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                    //square middle right
                    mobilityPath.push(new Rectangle(rightX - squareOffset, bottomY + offsetY, boxHeight, boxHeight));
                    //mobilityPathFill.addRect(PathUtilties.makeRectF(rightX - squareOffset, bottomY + offsetY, boxHeight, boxHeight), Direction.CW);

                }

            }

            //get mobility bounds
            if (mobilityPath != null && mobilityPath.length > 0) {

                //build mobility bounds
                mobilityBounds = mobilityPath[0].getBounds();
                let size: number = mobilityPath.length;
                let tempShape: any = null;
                for (var i = 1; i < size; i++) {
                    tempShape = mobilityPath[i];
                    mobilityBounds.union(tempShape.getBounds());
                }



                //grow bounds to handle strokeWidth
                if (ad === SymbolID.Mobility_ShortTowedArray || ad === SymbolID.Mobility_LongTowedArray) {

                    mobilityBounds.grow(Math.ceil((strokeWidthNL / 2)));
                }

                else {

                    mobilityBounds.grow(Math.ceil((strokeWidth / 2)));
                }

                imageBounds = imageBounds.createUnion(mobilityBounds.toRectangle2D());

            }
        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Leadership Indicator Modifier">
        let liBounds: Rectangle2D;
        let liPath: Path;
        let liTop: Point2D;
        let liLeft: Point2D;
        let liRight: Point2D;
        if (ad === SymbolID.Leadership_Individual && ss === SymbolID.SymbolSet_DismountedIndividuals &&
            (SymbolID.getFrameShape(symbolID) === SymbolID.FrameShape_DismountedIndividuals ||
                SymbolID.getFrameShape(symbolID) === SymbolID.FrameShape_Unknown)) {
            liPath = new Path();

            let si: int = SymbolID.getStandardIdentity(symbolID);
            let af: int = SymbolID.getAffiliation(symbolID);
            let c: int = SymbolID.getContext(symbolID);
            //int fs = SymbolID.getFrameShape(symbolID);
            let centerOffset: double = 0;
            let sideOffset: double = 0;
            let left: double = symbolBounds.getX();
            let right: double = symbolBounds.getX() + symbolBounds.getWidth();

            if (af === SymbolID.StandardIdentity_Affiliation_Unknown || af === SymbolID.StandardIdentity_Affiliation_Pending) {
                centerOffset = (symbolBounds.getHeight() * 0.1012528735632184);
                sideOffset = (right - left) * 0.3583513488109785;
                //left = symbolBounds.getCenterX() - ((symbolBounds.getWidth() / 2) * 0.66420458);
                //right = symbolBounds.getCenterX() + ((symbolBounds.getWidth() / 2) * 0.66420458);
            }
            if (af === SymbolID.StandardIdentity_Affiliation_Neutral) {
                centerOffset = (symbolBounds.getHeight() * 0.25378787878787878);
                sideOffset = (right - left) * 0.2051402812352822;
            }
            if (SymbolUtilities.isReality(symbolID) || SymbolUtilities.isSimulation(symbolID)) {
                if (af === SymbolID.StandardIdentity_Affiliation_Friend || af === SymbolID.StandardIdentity_Affiliation_AssumedFriend) {//hexagon friend/assumed friend
                    centerOffset = (symbolBounds.getHeight() * 0.08);
                    sideOffset = (right - left) * 0.282714524168219;//(symbolBounds.getHeight()*0.29);
                }
                else {
                    if (af === SymbolID.StandardIdentity_Affiliation_Hostile_Faker || af === SymbolID.StandardIdentity_Affiliation_Suspect_Joker) {//diamond hostile/suspect
                        left = symbolBounds.getCenterX() - ((symbolBounds.getWidth() / 2) * 1.0653694149);//1.07);//1.0653694149);
                        right = symbolBounds.getCenterX() + ((symbolBounds.getWidth() / 2) * 1.0653694149);//1.07);//1.0653694149);

                        centerOffset = (symbolBounds.getHeight() * 0.08);//0.0751139601139601
                        sideOffset = (right - left) * 0.4923255424955992;
                    }
                }

            }
            else//Exercise
            {
                //hexagon
                if (af !== SymbolID.StandardIdentity_Affiliation_Unknown ||
                    af === SymbolID.StandardIdentity_Affiliation_Neutral) {
                    centerOffset = (symbolBounds.getHeight() * 0.08);
                    sideOffset = (right - left) * 0.282714524168219;
                }
            }

            //create leadership indicator /\
            liTop = new Point2D(symbolBounds.getCenterX(), symbolBounds.getY() - centerOffset);
            liLeft = new Point2D(left, liTop.getY() + sideOffset);
            liRight = new Point2D(right, liTop.getY() + sideOffset);




            //liPath.append(new Line2D(liLeft.getX(),liLeft.getY(), liTop.getX(), liTop.getY()), false);
            //liPath.append(new Line2D(liTop.getX(), liTop.getY(), liRight.getX(), liRight.getY()), false);

            liPath.moveTo(liTop.getX(), liTop.getY());
            liPath.lineTo(liLeft.getX(), liLeft.getY());
            liPath.moveTo(liTop.getX(), liTop.getY());
            liPath.lineTo(liRight.getX(), liRight.getY());

            liBounds = liPath.getBounds().toRectangle2D();
            liBounds = new Rectangle2D(liLeft.getX(), liTop.getY(), liRight.getX() - liLeft.getX(), liLeft.getY() - liTop.getY());

            RectUtilities.grow(liBounds, 2);

            imageBounds = imageBounds.createUnion(liBounds);
        }

        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Echelon">
        //Draw Echelon
        let intEchelon: int = SymbolID.getAmplifierDescriptor(symbolID);// SymbolUtilitiesD.getEchelon(symbolID);//symbolID.substring(11, 12);
        let strEchelon: string;
        if (intEchelon > 10 && intEchelon < 29 && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.B_ECHELON)) {
            strEchelon = SymbolUtilities.getEchelonText(intEchelon);
        }
        if (strEchelon != null && SymbolUtilities.isInstallation(symbolID) === false
            && SymbolUtilities.hasModifier(symbolID, Modifiers.B_ECHELON)) {

            let echelonOffset: int = 2;
            let outlineOffset: int = RendererSettings.getInstance().getTextOutlineWidth();
            let modifierFont: Font = RendererSettings.getInstance().getLabelFont();
            //tiEchelon = new TextInfo(strEchelon, 0, 0, modifierFont, frc);
            stiEchelon = new SVGTextInfo(strEchelon, 0, 0, modifierFont.toString(), frc);
            echelonBounds = stiEchelon.getTextBounds();

            let y: int = Math.round(symbolBounds.getY() - echelonOffset) as int;
            let x: int = (Math.round(symbolBounds.getX()) + (symbolBounds.getWidth() / 2) - (echelonBounds.getWidth() / 2)) as int;
            stiEchelon.setLocation(x, y);

            //There will never be lowercase characters in an echelon so trim that fat.
            //Remove the descent from the bounding box.
            //needed?
            //tiEchelon.getTextOutlineBounds();//.shiftBR(0,Math.round(-(echelonbounds.getHeight()*0.3)));

            //make echelon bounds a little more spacious for things like nearby labels and Task Force.
            echelonBounds.grow(outlineOffset);

            //tiEchelon.getTextOutlineBounds();
            //                RectUtilities.shift(echelonBounds, x, -outlineOffset);
            //echelonBounds.shift(0,-outlineOffset);// - Math.round(echelonOffset/2));
            stiEchelon.setLocation(x, y - outlineOffset);

            imageBounds = imageBounds.createUnion(echelonBounds);

        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Task Force">
        let tfBounds: Rectangle2D;
        let tfRectangle: Rectangle2D;
        let hqtfd: int = SymbolID.getHQTFD(symbolID);
        if (SymbolUtilities.isTaskForce(symbolID)) {
            let height: int = Math.round(symbolBounds.getHeight() / 4) as int;
            let width: int = Math.round(symbolBounds.getWidth() / 3) as int;

            if (!SymbolUtilities.hasRectangleFrame(symbolID)) {
                height = Math.round(symbolBounds.getHeight() / 6) as int;
            }

            tfRectangle = new Rectangle2D((symbolBounds.getX() + width) as int,
                (symbolBounds.getY() - height) as int,
                width,
                height);

            tfBounds = new Rectangle2D((tfRectangle.getX() - 1) as int,
                (tfRectangle.getY() - 1) as int,
                (tfRectangle.getWidth() + 2) as int,
                (tfRectangle.getHeight() + 2) as int);

            if (echelonBounds != null) {
                let tfx: double = tfRectangle.getX();
                let tfw: double = tfRectangle.getWidth();
                let tfy: double = tfRectangle.getY();
                let tfh: double = tfRectangle.getHeight();

                if (echelonBounds.getWidth() > tfRectangle.getWidth()) {
                    tfx = symbolBounds.getX() + symbolBounds.getWidth() / 2 - (echelonBounds.getWidth() / 2) - 1;
                    tfw = echelonBounds.getWidth() + 2;
                }
                if (echelonBounds.getHeight() > tfRectangle.getHeight()) {
                    tfy = echelonBounds.getY() - 1;
                    tfh = echelonBounds.getHeight() + 2;

                }
                tfRectangle = new Rectangle2D(tfx,
                    tfy,// + outlineOffset,
                    tfw,
                    tfh);


                tfBounds = new Rectangle2D((tfRectangle.getX() - 1) as int,
                    (tfRectangle.getY() - 1) as int,
                    (tfRectangle.getWidth() + 2) as int,
                    (tfRectangle.getHeight() + 2) as int);

            }
            imageBounds = imageBounds.createUnion(tfBounds);
        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Feint Dummy Indicator">
        let fdiBounds: Rectangle2D;
        let fdiTop: Point2D;
        let fdiLeft: Point2D;
        let fdiRight: Point2D;

        if (SymbolUtilities.hasFDI(symbolID)
            && SymbolUtilities.hasModifier(symbolID, Modifiers.AB_FEINT_DUMMY_INDICATOR)) {
            //create feint indicator /\
            fdiLeft = new Point2D(symbolBounds.getX(), symbolBounds.getY());
            fdiRight = new Point2D((symbolBounds.getX() + symbolBounds.getWidth()), symbolBounds.getY());
            fdiTop = new Point2D(Math.round(symbolBounds.getCenterX()), Math.round(symbolBounds.getY() - (symbolBounds.getWidth() * .5)));


            fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());

            if (echelonBounds != null) {
                let shiftY: int = Math.round(symbolBounds.getY() - echelonBounds.getHeight() - 2) as int;
                fdiLeft.setLocation(fdiLeft.getX(), fdiLeft.getY() + shiftY);
                //fdiLeft.offset(0, shiftY);
                fdiTop.setLocation(fdiTop.getX(), fdiTop.getY() + shiftY);
                //fdiTop.offset(0, shiftY);
                fdiRight.setLocation(fdiRight.getX(), fdiRight.getY() + shiftY);
                //fdiRight.offset(0, shiftY);
                fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());
                //fdiBounds.offset(0, shiftY);
            }

            imageBounds = imageBounds.createUnion(fdiBounds);

        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Engagement Bar (AO)">
        //A:BBB-CC
        let strAO: string;
        let ebRectangle: Rectangle2D;
        let ebBounds: Rectangle2D;
        let ebTextBounds: Rectangle2D;
        let stiAO: SVGTextInfo;
        let ebTop: int = 0;
        let ebLeft: int = 0;
        let ebWidth: int = 0;
        let ebHeight: int = 0;
        let ebColor: Color;//SymbolUtilities.getFillColorOfAffiliation(symbolID);

        if (attributes.has(MilStdAttributes.EngagementBarColor)) {

            ebColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.EngagementBarColor));
        }

        else {

            ebColor = fillColor;
        }


        if (SymbolUtilities.hasModifier(symbolID, Modifiers.AO_ENGAGEMENT_BAR) &&
            modifiers.has(Modifiers.AO_ENGAGEMENT_BAR)) {

            strAO = modifiers.get(Modifiers.AO_ENGAGEMENT_BAR);
        }

        if (strAO != null) 
        {
            stiAO = new SVGTextInfo(strAO, 0, 0, ModifierRenderer._modifierFont, frc);
            
            ebTextBounds = stiAO.getTextBounds();
            ebHeight = ebTextBounds.getHeight() as int;

            if (fdiBounds != null)//set bar above FDI if present
            {
                ebTop = fdiBounds.getY() as int - ebHeight - 4;
            }
            else if (tfBounds != null)//set bar above TF if present
            {
                ebTop = tfBounds.getY() as int - ebHeight - 4;
            }
            else if (echelonBounds != null)//set bar above echelon if present
            {
                ebTop = echelonBounds.getY() as int - ebHeight - 4;
            }
            else if (SymbolUtilities.hasModifier(symbolID, Modifiers.C_QUANTITY) &&
                modifiers.has(Modifiers.C_QUANTITY)) {
                ebTop = symbolBounds.getY() as int - ebHeight * 2 - 4;
            }
            else if (ss === SymbolID.SymbolSet_LandInstallation) {
                ebTop = symbolBounds.getY() as int - ebHeight - 8;
            }
            else//position above symbol
            {
                ebTop = symbolBounds.getY() as int - ebHeight - 4;
            }


            //if text wider than symbol, extend the bar.
            if (ebTextBounds.getWidth() + 4 > symbolBounds.getWidth()) {
                ebWidth = ebTextBounds.getWidth() as int + 4;
                ebLeft = symbolCenter.getX() as int - (ebWidth / 2);
            }
            else {
                ebLeft = symbolBounds.getX() as int + 1;// - 2;//leave room for outline
                ebWidth = symbolBounds.getWidth() as int - 2;// + 4;//leave room for outline
            }
            
            //set text location within the bar
            stiAO.setLocation(symbolCenter.getX() as int, (ebTop + ebHeight - stiAO.getDescent()));

            ebRectangle = new Rectangle2D(ebLeft, ebTop, ebWidth, ebHeight);
            ebBounds = RectUtilities.copyRect(ebRectangle);
            RectUtilities.grow(ebBounds, 1);

            imageBounds = imageBounds.createUnion(ebBounds);
        }


        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Affiliation Modifier">
        //Draw Echelon
        //not needed for 2525D because built into the SVG files.
        let affiliationModifier: string;

        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === false) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {

            let amOffset: int = 2;
            let outlineOffset: int = RendererSettings.getInstance().getTextOutlineWidth();

            stiAM = new SVGTextInfo(affiliationModifier, 0, 0, RendererSettings.getInstance().getLabelFont().toString(), frc);
            amBounds = stiAM.getTextBounds();

            let x: int = 0;
            let y: int = 0;

            if (echelonBounds != null
                && ((echelonBounds.getMinX() + echelonBounds.getWidth() > symbolBounds.getMinX() + symbolBounds.getWidth()))) {
                y = Math.round(symbolBounds.getMinY() - amOffset) as int;
                x = (echelonBounds.getMinX() + echelonBounds.getWidth() + amOffset) as int;
            }
            if (ebBounds != null
                && ((ebBounds.getMinX() + ebBounds.getWidth() > symbolBounds.getMinX() + symbolBounds.getWidth()))) {
                y = Math.round(symbolBounds.getMinY() - amOffset) as int;
                x = (ebBounds.getMinX() + ebBounds.getWidth() + amOffset + RendererSettings.getInstance().getTextOutlineWidth()) as int;
            }
            else {
                y = Math.round(symbolBounds.getMinY() - amOffset) as int;
                x = (Math.round(symbolBounds.getMinX() + symbolBounds.getWidth() + amOffset + RendererSettings.getInstance().getTextOutlineWidth())) as int;
            }
            stiAM.setLocation(x, y);

            //adjust for outline.
            amBounds.grow(outlineOffset);
            ShapeUtilities.offset(amBounds, 0, -outlineOffset);
            stiAM.setLocation(x, y - outlineOffset);

            imageBounds = imageBounds.createUnion(amBounds);
        }//*/
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build HQ Staff">
        let pt1HQ: Point2D;
        let pt2HQ: Point2D;
        let hqBounds: Rectangle2D;
        //Draw HQ Staff
        if (SymbolUtilities.isHQ(symbolID)) {

            let affiliation: int = SymbolID.getAffiliation(symbolID);
            let context: int = SymbolID.getContext(symbolID);
            //get points for the HQ staff
            if (SymbolUtilities.hasRectangleFrame(symbolID)) {
                pt1HQ = new Point2D(symbolBounds.getX() + 1,
                    (symbolBounds.getY() + symbolBounds.getHeight()));
            }
            else {
                pt1HQ = new Point2D(symbolBounds.getX() as int + 1,
                    (symbolBounds.getY() + (symbolBounds.getHeight() / 2)) as int);
            }
            pt2HQ = new Point2D(pt1HQ.getX(), (pt1HQ.getY() + symbolBounds.getHeight()));

            //create bounding rectangle for HQ staff.
            hqBounds = new Rectangle2D(pt1HQ.getX(), pt1HQ.getY(), 2, pt2HQ.getY() - pt1HQ.getY());
            //adjust the image bounds accordingly.
            imageBounds = imageBounds.createUnion(new Rectangle2D(pt1HQ.getX(), pt1HQ.getY(), pt2HQ.getX() - pt1HQ.getX(), pt2HQ.getY() - pt1HQ.getY()));
            //RectUtilities.shiftBR(imageBounds, 0, (int) (pt2HQ.y - imageBounds.bottom));
            //imageBounds.shiftBR(0,pt2HQ.y-imageBounds.bottom);
            //adjust symbol center
            centerPoint.setLocation(pt2HQ.getX(), pt2HQ.getY());
        }

        // </editor-fold>
        // <editor-fold defaultstate="collapsed" desc="Build DOM Arrow">
        let domPoints: Point2D[];
        let domBounds: Rectangle2D;
        if (modifiers.has(Modifiers.Q_DIRECTION_OF_MOVEMENT) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.Q_DIRECTION_OF_MOVEMENT)) {
            let strQ: string = modifiers.get(Modifiers.Q_DIRECTION_OF_MOVEMENT);

            if (strQ != null && SymbolUtilities.isNumber(strQ)) {
                let q: float = parseFloat(strQ);

                let isY: boolean = (modifiers.has(Modifiers.Y_LOCATION));

                domPoints = ModifierRenderer.createDOMArrowPoints(symbolID, symbolBounds, new Point2D(centerPoint.x, centerPoint.y), q, isY, frc);

                domBounds = new Rectangle2D(domPoints[0].getX(), domPoints[0].getY(), 1, 1);

                let temp: Point2D;
                for (let i: int = 1; i < 6; i++) {
                    temp = domPoints[i];
                    if (temp != null) {
                        domBounds = domBounds.createUnion(new Rectangle2D(temp.getX(), temp.getY(), 1, 1));
                    }
                }
                imageBounds = imageBounds.createUnion(domBounds);
            }
        }

        // </editor-fold>
        // <editor-fold defaultstate="collapsed" desc="Build Operational Condition Indicator">
        let ociBounds: Rectangle2D;
        let ociShape: Rectangle2D;
        let ociSlashShape: Path;
        let ociOffset: int = 4;
        if (SymbolUtilities.hasModifier(symbolID, Modifiers.AL_OPERATIONAL_CONDITION)) {
            if (mobilityBounds != null) {
                ociOffset = Math.round((mobilityBounds.getY() + mobilityBounds.getHeight()) - (symbolBounds.getY() + symbolBounds.getHeight())) as int + 4;
            }
            if (RendererSettings.getInstance().getOperationalConditionModifierType() === RendererSettings.OperationalConditionModifierType_BAR) {
                ociShape = ModifierRenderer.processOperationalConditionIndicator(symbolID, symbolBounds, ociOffset);
                if (ociShape != null) {
                    let temp: Rectangle2D = ociShape.clone() as Rectangle2D;
                    ShapeUtilities.grow(temp, 1);
                    ociBounds = temp;
                    imageBounds = imageBounds.createUnion(ociBounds);
                }
            }
            else//slash
            {
                ociSlashShape = ModifierRenderer.processOperationalConditionIndicatorSlash(symbolID, symbolBounds);
                if (ociSlashShape != null) {
                    //build mobility bounds
                    ociBounds = ociSlashShape.getBounds().toRectangle2D();
                    imageBounds = imageBounds.createUnion(ociBounds);
                }
            }
        }

        // </editor-fold>
        //
        // <editor-fold defaultstate="collapsed" desc="Shift Modifiers">
        //adjust points if necessary

        // <editor-fold defaultstate="collapsed" desc="Convert to SVG (SVGSymbolInfo)">
        if (sdi instanceof SVGSymbolInfo) {
            let sbSVG:string = "";
            let temp: Path2D;
            let svgStroke: string = RendererUtilities.colorToHexString(lineColor, false);
            let svgFill: string = RendererUtilities.colorToHexString(fillColor, false);
            let svgTextColor: string = RendererUtilities.colorToHexString(textColor, false);
            let svgTextBGColor: string = RendererUtilities.colorToHexString(textBackgroundColor, false);
            let svgStrokeWidth: number = strokeWidth;
            let svgTextOutlineWidth: int = RendererSettings.getInstance().getTextOutlineWidth();
            let svgAlpha: string;
            if (alpha >= 0 && alpha <= 1) {

                svgAlpha = alpha.toString();
            }

            let svgDashArray: string;

            if (hqBounds != null) {
                let hqStaff: Line = new Line(pt1HQ.getX(), pt1HQ.getY(), pt2HQ.getX(), pt2HQ.getY());
                sbSVG += (hqStaff.toSVGElement(svgStroke, strokeWidth, null));
            }
            if (echelonBounds != null) {
                sbSVG += (stiEchelon.toSVGElement(svgTextColor, svgTextBGColor, svgTextOutlineWidth));
            }
            if (amBounds != null) {
                sbSVG += (stiAM.toSVGElement(svgTextColor, svgTextBGColor, svgTextOutlineWidth));
            }
            if (tfBounds != null) {

                sbSVG += (tfRectangle.toSVGElement(svgStroke, svgStrokeWidth, null));
            }
            if (ebBounds != null) {
                let svgEBFill: string = RendererUtilities.colorToHexString(ebColor, false);
                //create fill and outline
                sbSVG += (ebRectangle.toSVGElement(svgStroke, svgStrokeWidth, svgEBFill));
                //create internal text
                sbSVG += (stiAO.toSVGElement("#000000", null,0,"middle"));
            }
            if (fdiBounds != null) {
                let svgFDIDashArray: string = "6 4";
                let dashArray: number[] = [6, 4];

                if (symbolBounds.getHeight() < 20) {
                    svgFDIDashArray = "5 3";
                }

                let fdiPath: Path = new Path();
                fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                fdiPath.lineTo(fdiLeft.getX(), fdiLeft.getY());
                fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                fdiPath.lineTo(fdiRight.getX(), fdiRight.getY());//*/

                fdiPath.setLineDash(svgFDIDashArray);

                sbSVG += (fdiPath.toSVGElement(svgStroke, svgStrokeWidth, null));

            }
            if (liBounds != null) {
                let liStrokeWidth: int = 2;
                if (pixelSize < 100) {

                    liStrokeWidth = 1;
                }

                sbSVG += (liPath.toSVGElement(svgStroke, liStrokeWidth, null));
            }
            if (ociBounds != null && ociShape != null) {

                let status: int = SymbolID.getStatus(symbolID);
                let statusColor: Color;

                switch (status) {
                    //Fully Capable
                    case SymbolID.Status_Present_FullyCapable: {
                        statusColor = Color.green;
                        break;
                    }

                    //Damaged
                    case SymbolID.Status_Present_Damaged: {
                        statusColor = Color.yellow;
                        break;
                    }

                    //Destroyed
                    case SymbolID.Status_Present_Destroyed: {
                        statusColor = Color.red;
                        break;
                    }

                    //full to capacity(hospital)
                    case SymbolID.Status_Present_FullToCapacity: {
                        statusColor = Color.blue;
                        break;
                    }

                    default: {
                        break;
                    }

                }

                let svgOCIStatusColor: string = RendererUtilities.colorToHexString(statusColor, false);
                sbSVG += (ociBounds.toSVGElement(null, null, svgStroke));
                sbSVG += (ociShape.toSVGElement(null, null, svgOCIStatusColor));

                ociBounds = null;
                ociShape = null;

            }
            if (mobilityBounds != null) {

                let svgMobilitySW: number = svgStrokeWidth;
                if (!(ad > 30 && ad < 60))//mobility
                {
                    svgMobilitySW = strokeWidthNL;
                }

                for (let i = 0; i < mobilityPath.length; i++) {
                    if (mobilityPath[i].getShapeType() !== ShapeTypes.RECTANGLE) {
                        sbSVG += (mobilityPath[i].toSVGElement(svgStroke, svgMobilitySW, "none"));
                    }
                    else {
                        sbSVG += (mobilityPath[i].toSVGElement("none", 0, svgStroke));
                    }
                }

                /*sbSVG += (Shape2SVG.Convert(mobilityPath, svgStroke, null, svgMobilitySW, svgAlpha, svgAlpha, null));

                if (mobilityPathFill != null) {
                    sbSVG += (Shape2SVG.Convert(mobilityPathFill, "none", svgStroke, "0", svgAlpha, svgAlpha, null));
                }//*/

                mobilityBounds = null;
            }

            //add symbol
            ssi = sdi as SVGSymbolInfo;
            sbSVG += (ssi.getSVG());

            if (ociBounds != null && ociSlashShape != null) {
                let size: double = symbolBounds.getWidth();
                let ociStrokeWidth: float = 3;

                ociStrokeWidth = size as float / 20;
                if (ociStrokeWidth < 1) {

                    ociStrokeWidth = 1;
                }

                sbSVG += (ociSlashShape.toSVGElement(svgStroke, ociStrokeWidth, null));

                //sbSVG += (Shape2SVG.Convert(ociSlashShape, svgStroke, null, ociStrokeWidth.toString(), svgAlpha, svgAlpha, null));
                ociBounds = null;
                ociSlashShape = null;
            }

            if (domBounds != null) {
                let domPath: Path = new Path();

                domPath.moveTo(domPoints[0].getX(), domPoints[0].getY());
                if (domPoints[1] != null) {
                    domPath.lineTo(domPoints[1].getX(), domPoints[1].getY());
                }
                if (domPoints[2] != null) {
                    domPath.lineTo(domPoints[2].getX(), domPoints[2].getY());
                }

                sbSVG += (domPath.toSVGElement(svgStroke, svgStrokeWidth, null));
                //sbSVG += (Shape2SVG.Convert(domPath, svgStroke, null, svgStrokeWidth, svgAlpha, svgAlpha, null));

                domPath = new Path();

                domPath.moveTo(domPoints[3].getX(), domPoints[3].getY());
                domPath.lineTo(domPoints[4].getX(), domPoints[4].getY());
                domPath.lineTo(domPoints[5].getX(), domPoints[5].getY());
                sbSVG += (domPath.toSVGElement("none", 0, svgStroke));
                //sbSVG += (Shape2SVG.Convert(domPath, "none", svgStroke, "0", svgAlpha, svgAlpha, null));

                domBounds = null;
                domPoints = null;
            }

            newsdi = new SVGSymbolInfo(sbSVG.toString().valueOf(), new Point2D(centerPoint.x, centerPoint.y), symbolBounds, imageBounds);
        }



        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        // </editor-fold>

        //return newii;
        if (newsdi != null) {
            return newsdi;
        }
        else {
            return null;
        }
        //*/
        //return null;

    }

    /**
     *
     * @param symbolID
     * @return
     * @deprecated no longer a thing in 2525D
     * TODO: remove
     */
    private static getYPositionForSCC(symbolID: string): double {
        let yPosition: double = 0.32;
        /*int aff = SymbolID.getAffiliation(symbolID);
        int context = SymbolID.getContext(symbolID);
        char affiliation = symbolID.charAt(1);

        if(temp === "WMGC--")//GROUND (BOTTOM) MILCO
        {
            if(affiliation == 'H' ||
                    affiliation == 'S')//suspect
                yPosition = 0.29;
            else if(affiliation == 'N' ||
                    affiliation == 'L')//exercise neutral
                yPosition = 0.32;
            else if(affiliation == 'F' ||
                    affiliation == 'A' ||//assumed friend
                    affiliation == 'D' ||//exercise friend
                    affiliation == 'M' ||//exercise assumed friend
                    affiliation == 'K' ||//faker
                    affiliation == 'J')//joker
                yPosition = 0.32;
            else
                yPosition = 0.34;
        }
        else if(temp === "WMMC--")//MOORED MILCO
        {
            if(affiliation == 'H' ||
                    affiliation == 'S')//suspect
                yPosition = 0.25;
            else if(affiliation == 'N' ||
                    affiliation == 'L')//exercise neutral
                yPosition = 0.25;
            else if(affiliation == 'F' ||
                    affiliation == 'A' ||//assumed friend
                    affiliation == 'D' ||//exercise friend
                    affiliation == 'M' ||//exercise assumed friend
                    affiliation == 'K' ||//faker
                    affiliation == 'J')//joker
                yPosition = 0.25;
            else
                yPosition = 0.28;
        }
        else if(temp === "WMFC--")//FLOATING MILCO
        {
            if(affiliation == 'H' ||
                    affiliation == 'S')//suspect
                yPosition = 0.29;
            else if(affiliation == 'N' ||
                    affiliation == 'L')//exercise neutral
                yPosition = 0.32;
            else if(affiliation == 'F' ||
                    affiliation == 'A' ||//assumed friend
                    affiliation == 'D' ||//exercise friend
                    affiliation == 'M' ||//exercise assumed friend
                    affiliation == 'K' ||//faker
                    affiliation == 'J')//joker
                yPosition = 0.32;
            else
                yPosition= 0.34;
        }
        else if(temp === "WMC---")//GENERAL MILCO
        {
            if(affiliation == 'H' ||
                    affiliation == 'S')//suspect
                yPosition = 0.33;
            else if(affiliation == 'N' ||
                    affiliation == 'L')//exercise neutral
                yPosition = 0.36;
            else if(affiliation == 'F' ||
                    affiliation == 'A' ||//assumed friend
                    affiliation == 'D' ||//exercise friend
                    affiliation == 'M' ||//exercise assumed friend
                    affiliation == 'K' ||//faker
                    affiliation == 'J')//joker
                yPosition = 0.36;
            else
                yPosition = 0.36;
        }*/

        return yPosition;
    }

    /**
     *
     * @param {type} symbolID
     * @param {type} bounds symbolBounds SO.Rectangle
     * @param {type} center SO.Point Location where symbol is centered.
     * @param {type} angle in degrees
     * @param {Boolean} isY Boolean. (Y modifier is present)
     * @returns {Array} of SO.Point. First 3 items are the line. Last three are
     * the arrowhead.
     */
    private static createDOMArrowPoints(symbolID: string, bounds: Rectangle2D, center: Point2D, angle: float, isY: boolean, frc: OffscreenCanvasRenderingContext2D): Point2D[] {
        let arrowPoints: Point2D[] = new Array<Point2D>(6);
        let pt1: Point2D;
        let pt2: Point2D;
        let pt3: Point2D;


        let length: int = 40;
        if (SymbolUtilities.isCBRNEvent(symbolID)) {
            length = Math.round(bounds.getHeight() / 2) as int;
        }
        else {
            if ((SymbolUtilities.isHQ(symbolID))) {
                if (SymbolUtilities.hasRectangleFrame(symbolID)) {

                    length = Math.round(bounds.getHeight()) as int;
                }

                else {

                    length = Math.round(bounds.getHeight() * 0.7) as int;
                }

            }
            else {
                if (bounds.getHeight() >= 100) {
                    length = Math.round(bounds.getHeight() * 0.7) as int;
                }
            }

        }


        //get endpoint
        let dx2: int = 0;
        let dy2: int = 0;
        let
            x1: int = 0;
        let y1: int = 0;
        let
            x2: int = 0;
        let y2: int = 0;

        x1 = Math.round(center.getX()) as int;
        y1 = Math.round(center.getY()) as int;

        pt1 = new Point2D(x1, y1);

        if (SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.Q_DIRECTION_OF_MOVEMENT) &&
            SymbolUtilities.isCBRNEvent(symbolID) || SymbolUtilities.isLand(symbolID)) {
            //drawStaff = true;
            if (SymbolUtilities.isHQ(symbolID) === false)//has HQ staff to start from
            {
                y1 = (bounds.getY() + bounds.getHeight()) as int;
                pt1 = new Point2D(x1, y1);

                if (isY === true && SymbolUtilities.isCBRNEvent(symbolID))//make room for y modifier
                {
                    let yModifierOffset: int = ModifierRenderer._modifierFontHeight as int;

                    yModifierOffset += ModifierRenderer.RS.getTextOutlineWidth();

                    pt1.setLocation(pt1.getX(), pt1.getY() + yModifierOffset);
                }//*/

                y1 = y1 + length;
                pt2 = new Point2D(x1, y1);
            }
            else {
                x1 = bounds.getX() as int + 1;

                if (SymbolUtilities.hasRectangleFrame(symbolID)) {
                    /*y1 = bounds.top + bounds.height();
                    pt1 = new Point(x1, y1);
                    y1 = y1 + length;
                    pt2 = new Point(x1, y1);//*/

                    y1 = (bounds.getY() + bounds.getHeight()) as int;
                    pt1 = new Point2D(x1, y1);
                    y1 = y1 + length;
                    pt2 = new Point2D(x1, y1);//*/

                }
                else {
                    y1 = (bounds.getY() + (bounds.getHeight() / 2)) as int;
                    pt1 = new Point2D(x1, y1);

                    x2 = x1;
                    y1 = (pt1.getY() + bounds.getHeight()) as int;
                    pt2 = new Point2D(x2, y1);

                    //I feel like the below code is the same as above but it didn't work out that way
                    //keeping to try and figure out later
                    /*y1 = (int)(bounds.getY() + (bounds.getHeight() / 2));
                    pt1 = new Point2D(x1, y1);

                    x2 = x1;
                    y2 = (int)(pt1.getY() + bounds.getHeight());
                    pt2= new Point2D(x2, y2);*/
                }
            }
        }

        //get endpoint given start point and an angle
        //x2 = x1 + (length * Math.cos(radians)));
        //y2 = y1 + (length * Math.sin(radians)));
        angle = angle - 90;//in java, east is zero, we want north to be zero
        let radians: double = 0;
        radians = (angle * (Math.PI / 180));//convert degrees to radians

        dx2 = x1 + (length * Math.cos(radians)) as int;
        dy2 = y1 + (length * Math.sin(radians)) as int;
        x2 = Math.round(dx2);
        y2 = Math.round(dy2);

        //create arrowhead//////////////////////////////////////////////////////
        let arrowWidth: float = 10.0;
        let //8.0f,//6.5f;//7.0f;//6.5f;//10.0f//default
            theta: float = 0.423;//higher value == shorter arrow head//*/

        if (length < 50) {
            theta = 0.55;
        }
        /*float arrowWidth = length * .09f,// 16.0f,//8.0f,//6.5f;//7.0f;//6.5f;//10.0f//default
         theta = length * .0025f;//0.423f;//higher value == shorter arrow head
         if(arrowWidth < 8)
         arrowWidth = 8f;//*/

        let xPoints: number[] = new Array<number>(3);//3
        let yPoints: number[] = new Array<number>(3);//3
        let vecLine: number[] = new Array<number>(2);//2
        let vecLeft: number[] = new Array<number>(2);//2
        let fLength: double = 0;
        let th: double = 0;
        let ta: double = 0;
        let baseX: double = 0;
        let baseY: double = 0;

        xPoints[0] = x2;
        yPoints[0] = y2;

        //build the line vector
        vecLine[0] = (xPoints[0] - x1);
        vecLine[1] = (yPoints[0] - y1);

        //build the arrow base vector - normal to the line
        vecLeft[0] = -vecLine[1];
        vecLeft[1] = vecLine[0];

        //setup length parameters
        fLength = Math.sqrt(vecLine[0] * vecLine[0] + vecLine[1] * vecLine[1]);
        th = arrowWidth / (2.0 * fLength);
        ta = arrowWidth / (2.0 * (Math.tan(theta) / 2.0) * fLength);

        //find base of the arrow
        baseX = (xPoints[0] - ta * vecLine[0]);
        baseY = (yPoints[0] - ta * vecLine[1]);

        //build the points on the sides of the arrow
        xPoints[1] = Math.round(baseX + th * vecLeft[0]) as int;
        yPoints[1] = Math.round(baseY + th * vecLeft[1]) as int;
        xPoints[2] = Math.round(baseX - th * vecLeft[0]) as int;
        yPoints[2] = Math.round(baseY - th * vecLeft[1]) as int;

        //line.lineTo((int)baseX, (int)baseY);
        pt3 = new Point2D(Math.round(baseX), Math.round(baseY));

        //arrowHead = new Polygon(xPoints, yPoints, 3);
        arrowPoints[0] = pt1;//new Point2D(pt1.getX(), pt1.getY());
        arrowPoints[1] = pt2;//new Point2D(pt2.getX(), pt2.getY());
        arrowPoints[2] = pt3;//new Point2D(pt3.getX(), pt3.getY());
        arrowPoints[3] = new Point2D(xPoints[0], yPoints[0]);
        arrowPoints[4] = new Point2D(xPoints[1], yPoints[1]);
        arrowPoints[5] = new Point2D(xPoints[2], yPoints[2]);

        return arrowPoints;

    }

    private static drawDOMArrow(g2d: OffscreenCanvasRenderingContext2D, domPoints: Point2D[], color: Color, strokeWidth: float): void {
        let stroke: BasicStroke = new BasicStroke(strokeWidth, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 10.0);

        let domPath: Path = new Path();

        domPath.moveTo(domPoints[0].getX(), domPoints[0].getY());
        if (domPoints[1] != null) {
            domPath.lineTo(domPoints[1].getX(), domPoints[1].getY());
        }
        if (domPoints[2] != null) {
            domPath.lineTo(domPoints[2].getX(), domPoints[2].getY());
        }
        /*g2d.setStroke(stroke);
        g2d.stroke = 
        g2d.setColor(color);
        g2d.draw(domPath);

        domPath.reset();//*/

        domPath.moveTo(domPoints[3].getX(), domPoints[3].getY());
        domPath.lineTo(domPoints[4].getX(), domPoints[4].getY());
        domPath.lineTo(domPoints[5].getX(), domPoints[5].getY());
        //g2d.fill(domPath);
        domPath.fill(g2d);
    }

    private static processOperationalConditionIndicator(symbolID: string, symbolBounds: Rectangle2D, offsetY: int): Rectangle2D {
        //create Operational Condition Indicator
        //set color
        let bar: Rectangle2D;
        let status: int = 0;
        let statusColor: Color;
        let barSize: int = 0;
        let pixelSize: int = symbolBounds.getHeight() as int;

        status = SymbolID.getStatus(symbolID);
        if (status === SymbolID.Status_Present_FullyCapable ||
            status === SymbolID.Status_Present_Damaged ||
            status === SymbolID.Status_Present_Destroyed ||
            status === SymbolID.Status_Present_FullToCapacity) {
            if (pixelSize > 0) {
                barSize = Math.round(pixelSize / 5);
            }

            if (barSize < 2) {
                barSize = 2;
            }

            offsetY += Math.round(symbolBounds.getY() + symbolBounds.getHeight());

            bar = new Rectangle2D(symbolBounds.getX() as int + 2, offsetY, Math.round(symbolBounds.getWidth()) as int - 4, barSize);
        }

        return bar;
    }

    private static processOperationalConditionIndicatorSlash(symbolID: string, symbolBounds: Rectangle2D): Path {
        //create Operational Condition Indicator
        let path: Path;
        let status: int = 0;
        status = SymbolID.getStatus(symbolID);

        if (status === SymbolID.Status_Present_Damaged || status === SymbolID.Status_Present_Destroyed) {
            let widthRatio: float = SymbolUtilities.getUnitRatioWidth(symbolID);
            let heightRatio: float = SymbolUtilities.getUnitRatioHeight(symbolID);

            let slashHeight: double = (symbolBounds.getHeight() / heightRatio * 1.47);
            let slashWidth: double = (symbolBounds.getWidth() / widthRatio * 0.85);
            let centerX: double = symbolBounds.getCenterX();
            let centerY: double = symbolBounds.getCenterY();
            path = new Path();
            if (status === SymbolID.Status_Present_Damaged)//Damaged /
            {
                path.moveTo(centerX - (slashWidth / 2), centerY + (slashHeight / 2));
                path.lineTo(centerX + (slashWidth / 2), centerY - (slashHeight / 2));
            }
            else {
                if (status === SymbolID.Status_Present_Destroyed)//Destroyed X
                {
                    path.moveTo(centerX - (slashWidth / 2), centerY + (slashHeight / 2));
                    path.lineTo(centerX + (slashWidth / 2), centerY - (slashHeight / 2));
                    path.moveTo(centerX - (slashWidth / 2), centerY - (slashHeight / 2));
                    path.lineTo(centerX + (slashWidth / 2), centerY + (slashHeight / 2));
                }
            }

            return path;

        }

        return path;
    }

    /**
     * uses 2525C layout which shows most modifiers
     *
     * @param sdi
     * @param symbolID
     * @param modifiers
     * @param attributes
     * @return
     */
    public static processUnknownTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = new Rectangle(sdi.getImageBounds().getX() as int, sdi.getImageBounds().getY() as int, sdi.getImageBounds().getWidth() as int, sdi.getImageBounds().getHeight() as int).toRectangle2D();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//W            E/F
        //            int y1 = 0;//X/Y          G
        //            int y2 = 0;//V/AD/AE      H/AF
        //            int y3 = 0;//T            M CC
        //            int y4 = 0;//Z            J/K/L/N/P
        //
        //            y0 = bounds.y - 0;
        //            y1 = bounds.y - labelHeight;
        //            y2 = bounds.y - (labelHeight + (int)bufferText) * 2;
        //            y3 = bounds.y - (labelHeight + (int)bufferText) * 3;
        //            y4 = bounds.y - (labelHeight + (int)bufferText) * 4;
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        //if(Modifiers.C_QUANTITY in modifiers
        if (modifiers.has(Modifiers.C_QUANTITY)
            && SymbolUtilities.hasModifier(symbolID, Modifiers.C_QUANTITY)) {
            let text: string = modifiers.get(Modifiers.C_QUANTITY);
            if (text != null) {
                //bounds = armyc2.c5isr.renderer.utilities.RendererUtilities.getTextOutlineBounds(_modifierFont, text, new SO.Point(0,0));
                tiTemp = new TextInfo(text, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;
                x = Math.round((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;
                y = Math.round(symbolBounds.getY() - bufferY - tiTemp.getDescent()) as int;
                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) && SymbolUtilities.hasModifier(symbolID, Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                if (!byLabelHeight) {
                    x = Math.round(bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                    y = Math.round(bounds.getY() + labelHeight - tiTemp.getDescent()) as int;
                }
                else {
                    x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;

                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = y - ((labelHeight + bufferText));
                    y = (bounds.getY() + y) as int;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) && SymbolUtilities.hasModifier(symbolID, Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                if (!byLabelHeight) {
                    y = (bounds.getY() + labelHeight - tiTemp.getDescent()) as int;
                }
                else {
                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = y - ((labelHeight + bufferText));
                    y = (bounds.getY() + y) as int;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if ((modifiers.has(Modifiers.V_EQUIP_TYPE)) ||
            (modifiers.has(Modifiers.AD_PLATFORM_TYPE)) ||
            (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME))) {
            let vm: string;
            let
                adm: string;
            let
                aem: string;

            if (modifiers.has(Modifiers.V_EQUIP_TYPE) && SymbolUtilities.hasModifier(symbolID, Modifiers.V_EQUIP_TYPE)) {
                vm = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }
            if (modifiers.has(Modifiers.AD_PLATFORM_TYPE) && SymbolUtilities.hasModifier(symbolID, Modifiers.AD_PLATFORM_TYPE)) {
                adm = modifiers.get(Modifiers.AD_PLATFORM_TYPE);
            }
            if (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME) && SymbolUtilities.hasModifier(symbolID, Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
                aem = modifiers.get(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
            }

            modifierValue = "";
            if (vm != null && vm !== "") {

                modifierValue = vm;
            }

            if (adm != null && adm !== "") {

                modifierValue += " " + adm;
            }

            if (aem != null && aem !== "") {

                modifierValue += " " + aem;
            }


            if (modifierValue != null) {

                modifierValue = modifierValue.trim();
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;

                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - tiTemp.getDescent()) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1) || modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            modifierValue = "";
            let hm: string = "";
            let
                afm: string = "";

            hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }
            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER) && SymbolUtilities.hasModifier(symbolID, Modifiers.AF_COMMON_IDENTIFIER)) {
                afm = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }

            modifierValue = hm + " " + afm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;

                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - tiTemp.getDescent()) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                if (!byLabelHeight) {
                    x = bounds.getX() as int - labelWidth - bufferXL;
                    y = (bounds.getY() + bounds.getHeight()) as int;
                }
                else {
                    x = (bounds.getX() - labelWidth - bufferXL) as int;

                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = (y + ((labelHeight + bufferText) - tiTemp.getDescent())) as int;
                    y = (bounds.getY() + y) as int;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION) || modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION) && SymbolUtilities.hasModifier(symbolID, Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                if (modifierValue.length > 0) {
                    modifierValue += " ";
                }
                modifierValue += modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                if (!byLabelHeight) {
                    y = (bounds.getY() + bounds.getHeight()) as int;
                }
                else {
                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = (y + ((labelHeight + bufferText - tiTemp.getDescent()))) as int;
                    y = bounds.getY() as int + y;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED) && SymbolUtilities.hasModifier(symbolID, Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelWidth - bufferXL) as int;
                if (!byLabelHeight) {
                    y = (Math.round(bounds.getY() + bounds.getHeight() + labelHeight + bufferText)) as int;
                }
                else {
                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = (y + ((labelHeight + bufferText) * 2) - (tiTemp.getDescent() * 2)) as int;
                    y = Math.round(bounds.getY() + y) as int;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.L_SIGNATURE_EQUIP)//
            || modifiers.has(Modifiers.N_HOSTILE)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                km: string;
            let
                lm: string;
            let
                nm: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS) && SymbolUtilities.hasModifier(symbolID, Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.L_SIGNATURE_EQUIP) && SymbolUtilities.hasModifier(symbolID, Modifiers.L_SIGNATURE_EQUIP)) {
                lm = modifiers.get(Modifiers.L_SIGNATURE_EQUIP);
            }
            if (modifiers.has(Modifiers.N_HOSTILE) && SymbolUtilities.hasModifier(symbolID, Modifiers.N_HOSTILE)) {
                nm = modifiers.get(Modifiers.N_HOSTILE);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.hasModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (lm != null && lm !== "") {
                modifierValue = modifierValue + " " + lm;
            }
            if (nm != null && nm !== "") {
                modifierValue = modifierValue + " " + nm;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                if (!byLabelHeight) {
                    y = (Math.round(bounds.getY() + bounds.getHeight() + labelHeight + bufferText)) as int;
                }
                else {
                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = (y + ((labelHeight + bufferText) * 2) - (tiTemp.getDescent() * 2)) as int;
                    y = Math.round(bounds.getY() + y) as int;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                if (!byLabelHeight) {
                    x = (bounds.getX() - labelWidth - bufferXL) as int;
                    y = (bounds.getY() - bufferY - tiTemp.getDescent()) as int;
                }
                else {
                    x = (bounds.getX() - labelWidth - bufferXL) as int;

                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = y - ((labelHeight + bufferText) * 2);
                    y = bounds.getY() as int + y;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.F_REINFORCED_REDUCED) || modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = null;
            let E: string;
            let
                F: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.F_REINFORCED_REDUCED) && SymbolUtilities.hasModifier(symbolID, Modifiers.F_REINFORCED_REDUCED)) {
                F = modifiers.get(Modifiers.F_REINFORCED_REDUCED);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (F != null && F !== "") {
                if (F.toUpperCase() === ("R")) {
                    F = "(+)";
                }
                else if (F.toUpperCase() === ("D")) {
                    F = "(-)";
                }
                else if (F.toUpperCase() === ("RD")) {
                    F = "(" + String.fromCharCode(177) + ")";
                }
            }

            if (F != null && F !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + F;
                }
                else {
                    modifierValue = F;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                if (!byLabelHeight) {
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    y = (bounds.getY() - bufferY - tiTemp.getDescent()) as int;
                }
                else {
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;

                    y = (bounds.getHeight()) as int;
                    y = ((y * 0.5) + (labelHeight * 0.5)) as int;

                    y = y - ((labelHeight + bufferText) * 2);
                    y = bounds.getY() as int + y;
                }

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.AA_SPECIAL_C2_HQ) && SymbolUtilities.hasModifier(symbolID, Modifiers.AA_SPECIAL_C2_HQ)) {
            modifierValue = modifiers.get(Modifiers.AA_SPECIAL_C2_HQ);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = ((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;

                y = (symbolBounds.getHeight()) as int;//checkpoint, get box above the point
                y = ((y * 0.5) + ((labelHeight - tiTemp.getDescent()) * 0.5)) as int;
                y = symbolBounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        // </editor-fold>
        
        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;

    }

    /**
     * @param sdi
     * @param symbolID
     * @param modifiers
     * @param attributes
     * @return
     */
    public static processLandUnitTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());

        let ss: int = SymbolID.getSymbolSet(symbolID);



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//W            E/F
        //            int y1 = 0;//X/Y          G
        //            int y2 = 0;//V/AD/AE      H/AF
        //            int y3 = 0;//T            M CC
        //            int y4 = 0;//Z            J/K/L/N/P
        //
        //            y0 = bounds.y - 0;
        //            y1 = bounds.y - labelHeight;
        //            y2 = bounds.y - (labelHeight + (int)bufferText) * 2;
        //            y3 = bounds.y - (labelHeight + (int)bufferText) * 3;
        //            y4 = bounds.y - (labelHeight + (int)bufferText) * 4;
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) && SymbolUtilities.hasModifier(symbolID, Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                y = (bounds.getY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) && SymbolUtilities.hasModifier(symbolID, Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //just below center on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                y = (bounds.getY() + (bounds.getHeight() / 2 + labelHeight + (bufferText / 2) - descent)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //below T on left
                x = bounds.getX() as int - labelWidth - bufferXL;
                y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 2))) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = "";

            let jm: string;
            let
                km: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //above X/Y on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.F_REINFORCED_REDUCED) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string;
            let
                F: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.F_REINFORCED_REDUCED)) {
                F = modifiers.get(Modifiers.F_REINFORCED_REDUCED);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (F != null && F !== "") {
                if (F.toUpperCase() === ("R")) {
                    F = "(+)";
                }
                else if (F.toUpperCase() === ("D")) {
                    F = "(-)";
                }
                else if (F.toUpperCase() === ("RD")) {
                    F = "(" + String.fromCharCode(177) + ")";
                }
            }

            if (F != null && F !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + F;
                }
                else {
                    modifierValue = F;
                }
            }

            if (AS != null && AS !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + AS;
                }
                else {
                    modifierValue = AS;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.AA_SPECIAL_C2_HQ) && SymbolUtilities.hasModifier(symbolID, Modifiers.AA_SPECIAL_C2_HQ)) {
            modifierValue = modifiers.get(Modifiers.AA_SPECIAL_C2_HQ);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = ((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;

                y = (symbolBounds.getHeight()) as int;//checkpoint, get box above the point
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = symbolBounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;

    }

    public static processLandUnitTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;
        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color = RendererUtilities.getIdealOutlineColor(textColor);

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        //Rectangle2D imageBounds = new Rectangle(0,0, sdi.getImage().getWidth(), sdi.getImage().getHeight());
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());

        let ss: int = SymbolID.getSymbolSet(symbolID);



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//W            E/F
        //            int y1 = 0;//X/Y          G/AQ
        //            int y2 = 0;//V/AD/AE      H/AF
        //            int y3 = 0;//T            M CC
        //            int y4 = 0;//Z            J/K/L/N/P
        //
        //            y0 = bounds.y - 0;
        //            y1 = bounds.y - labelHeight;
        //            y2 = bounds.y - (labelHeight + (int)bufferText) * 2;
        //            y3 = bounds.y - (labelHeight + (int)bufferText) * 3;
        //            y4 = bounds.y - (labelHeight + (int)bufferText) * 4;
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) && SymbolUtilities.hasModifier(symbolID, Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //just above V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {
            modifierValue = null;

            let gm: string;
            let
                aqm: string;

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS) && SymbolUtilities.hasModifier(symbolID, Modifiers.G_STAFF_COMMENTS)) {
                gm = modifiers.get(Modifiers.G_STAFF_COMMENTS);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {
                aqm = modifiers.get(Modifiers.AQ_GUARDED_UNIT);// ym = modifiers.Y;
            }
            if (gm == null && aqm != null) {
                modifierValue = aqm;
            }
            else {
                if (gm != null && aqm == null) {
                    modifierValue = gm;
                }
                else {
                    if (gm != null && aqm != null) {
                        modifierValue = gm + "  " + aqm;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1) || modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            modifierValue = null;
            let hm: string;
            let afm: string;

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }
            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
                afm = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }
            if (hm == null && afm != null) {
                modifierValue = afm;
            }
            else {
                if (hm != null && afm == null) {
                    modifierValue = hm;
                }
                else {
                    if (hm != null && afm != null) {
                        modifierValue = hm + "  " + afm;
                    }
                }

            }


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE) || modifiers.has(Modifiers.AD_PLATFORM_TYPE) || modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
            modifierValue = "";

            let vm: string;
            let
                adm: string;
            let
                aem: string;

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
                vm = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }
            if (modifiers.has(Modifiers.AD_PLATFORM_TYPE)) {
                adm = modifiers.get(Modifiers.AD_PLATFORM_TYPE);
            }
            if (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
                aem = modifiers.get(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
            }
            if (vm != null && vm !== "") {
                modifierValue = modifierValue + vm;
            }
            if (adm != null && adm !== "") {
                modifierValue = modifierValue + " " + adm;
            }
            if (aem != null && aem !== "") {
                modifierValue = modifierValue + " " + aem;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //just below center on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //just below V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //below T on left
                x = bounds.getX() as int - labelWidth - bufferXL;
                //below T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.L_SIGNATURE_EQUIP)
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = "";

            let jm: string;
            let
                km: string;
            let
                lm: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.L_SIGNATURE_EQUIP)) {
                lm = modifiers.get(Modifiers.L_SIGNATURE_EQUIP);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (lm != null && lm !== "") {
                modifierValue = modifierValue + " " + lm;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //above X/Y on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //above X/Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.F_REINFORCED_REDUCED) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string;
            let
                F: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.F_REINFORCED_REDUCED)) {
                F = modifiers.get(Modifiers.F_REINFORCED_REDUCED);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (F != null && F !== "") {
                if (F.toUpperCase() === ("R")) {
                    F = "(+)";
                }
                else {
                    if (F.toUpperCase() === ("D")) {
                        F = "(-)";
                    }
                    else {
                        if (F.toUpperCase() === ("RD")) {
                            F = "(" + String.fromCharCode(177) + ")";
                        }
                    }

                }

            }

            if (F != null && F !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + F;
                }
                else {
                    modifierValue = F;
                }
            }

            if (AS != null && AS !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + AS;
                }
                else {
                    modifierValue = AS;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.AA_SPECIAL_C2_HQ) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.AA_SPECIAL_C2_HQ)) {
            modifierValue = modifiers.get(Modifiers.AA_SPECIAL_C2_HQ);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = ((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;

                y = (symbolBounds.getHeight()) as int;//checkpoint, get box above the point
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = symbolBounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;

    }

    public static processAirSpaceUnitTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/



        //            int y0 = 0;//             T
        //            int y1 = 0;//             P
        //            int y2 =                  V
        //            int y3 = 0;//             Z/X
        //            int y4 = 0;//             G/H
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {

            let gm: string = "";
            let hm: string = "";
            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                gm = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }


            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {

                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }


            modifierValue = gm + " " + hm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //on bottom
                y = (bounds.getY() + bounds.getHeight()) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED) || modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
            modifierValue = "";
            let zm: string = "";
            let xm: string = "";
            if (modifiers.has(Modifiers.Z_SPEED)) {

                zm = modifiers.get(Modifiers.Z_SPEED);
            }


            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {

                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
            }


            modifierValue = zm + " " + xm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //on bottom
                y = (bounds.getY() + bounds.getHeight() - labelHeight) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = modifiers.get(Modifiers.V_EQUIP_TYPE);

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above Z
                y = (bounds.getY() + bounds.getHeight() - (labelHeight * 2)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (SymbolUtilities.isAir(symbolID)) {
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                modifierValue = modifiers.get(Modifiers.P_IFF_SIF_AIS);

                if (modifierValue != null && modifierValue !== "") {
                    tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelBounds = tiTemp.getTextBounds();
                    labelWidth = labelBounds.getWidth() as int;

                    //right
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    //above Z
                    y = (bounds.getY() + bounds.getHeight() - (labelHeight * 3)) as int;

                    tiTemp.setLocation(x, y);
                    tiArray.push(tiTemp);

                }
            }

            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

                if (modifierValue != null && modifierValue !== "") {
                    tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelBounds = tiTemp.getTextBounds();
                    labelWidth = labelBounds.getWidth() as int;

                    //right
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    //above Z
                    y = (bounds.getY() + bounds.getHeight() - (labelHeight * 4)) as int;

                    tiTemp.setLocation(x, y);
                    tiArray.push(tiTemp);

                }
            }

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                modifierValue = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);

                if (modifierValue != null && modifierValue !== "") {
                    tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelBounds = tiTemp.getTextBounds();
                    labelWidth = labelBounds.getWidth() as int;

                    //right
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    //above Z
                    y = (bounds.getY() + bounds.getHeight() - (labelHeight * 5)) as int;

                    tiTemp.setLocation(x, y);
                    tiArray.push(tiTemp);

                }
            }
        }
        else //space
        {
            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

                if (modifierValue != null && modifierValue !== "") {
                    tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelBounds = tiTemp.getTextBounds();
                    labelWidth = labelBounds.getWidth() as int;

                    //right
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    //above Z
                    y = (bounds.getY() + bounds.getHeight() - (labelHeight * 3)) as int;

                    tiTemp.setLocation(x, y);
                    tiArray.push(tiTemp);

                }
            }

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                modifierValue = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);

                if (modifierValue != null && modifierValue !== "") {
                    tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelBounds = tiTemp.getTextBounds();
                    labelWidth = labelBounds.getWidth() as int;

                    //right
                    x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                    //above Z
                    y = (bounds.getY() + bounds.getHeight() - (labelHeight * 4)) as int;

                    tiTemp.setLocation(x, y);
                    tiArray.push(tiTemp);

                }
            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processAirSpaceUnitTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/



        //            int y0 = 0;//             AS
        //            int y1 = 0;//             T
        //            int y2 =                  V
        //            int y3 = 0;//             X/Z
        //            int y4 = 0;//             G/H
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {

            let gm: string = "";
            let hm: string = "";
            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                gm = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }


            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {

                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }


            modifierValue = gm + " " + hm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //on bottom
                y = (bounds.getY() + bounds.getHeight()) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED) || modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
            modifierValue = null;
            let zm: string = "";
            let xm: string = "";
            if (modifiers.has(Modifiers.Z_SPEED)) {

                zm = modifiers.get(Modifiers.Z_SPEED);
            }


            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {

                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
            }


            modifierValue = xm + " " + zm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //on bottom
                y = (bounds.getY() + bounds.getHeight() - labelHeight) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE) || modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            modifierValue = null;
            let vm: string = "";
            let afm: string = "";

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {

                vm = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }


            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER) && SymbolID.getSymbolSet(symbolID) === SymbolID.SymbolSet_Air) {

                afm = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }


            modifierValue = vm + " " + afm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above Z
                y = (bounds.getY() + bounds.getHeight() - (labelHeight * 2)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above Z
                y = (bounds.getY() + bounds.getHeight() - (labelHeight * 3)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.AS_COUNTRY) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = null;
            let em: string = "";
            let asm: string = "";

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {

                em = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }

            if (modifiers.has(Modifiers.AS_COUNTRY)) {

                asm = modifiers.get(Modifiers.AS_COUNTRY);
            }


            modifierValue = em + " " + asm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above Z
                y = (bounds.getY() + bounds.getHeight() - (labelHeight * 4)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processLandEquipmentTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/


        //                                 C
        //            int y0 = 0;//W/AR         AS
        //            int y1 = 0;//X/Y          G/AQ
        //            int y2 = 0;//V/AD/AE      H/AF
        //            int y3 = 0;//T            M
        //            int y4 = 0;//Z            J/N/L/P
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        //if(Modifiers.C_QUANTITY in modifiers
        if (modifiers.has(Modifiers.C_QUANTITY)) {
            let text: string = modifiers.get(Modifiers.C_QUANTITY);
            if (text != null) {
                //bounds = armyc2.c5isr.renderer.utilities.RendererUtilities.getTextOutlineBounds(_modifierFont, text, new SO.Point(0,0));
                tiTemp = new TextInfo(text, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;
                x = Math.round((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;
                y = Math.round(symbolBounds.getY() - bufferY - descent) as int;
                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just above V/AD/AE
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {
            modifierValue = "";
            let mg: string = "";
            let maq: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                mg = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {

                maq = modifiers.get(Modifiers.AQ_GUARDED_UNIT);
            }


            modifierValue = mg + " " + maq;

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1) || modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            modifierValue = "";
            let hm: string = "";
            let
                afm: string = "";

            hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }
            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
                afm = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }

            modifierValue = hm + " " + afm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just below V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        if (modifiers.has(Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //below T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent);
                y = Math.round(bounds.getY() + y) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.L_SIGNATURE_EQUIP)//
            || modifiers.has(Modifiers.N_HOSTILE)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                lm: string;
            let
                nm: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.L_SIGNATURE_EQUIP) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.L_SIGNATURE_EQUIP)) {
                lm = modifiers.get(Modifiers.L_SIGNATURE_EQUIP);
            }
            if (modifiers.has(Modifiers.N_HOSTILE) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.N_HOSTILE)) {
                nm = modifiers.get(Modifiers.N_HOSTILE);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (lm != null && lm !== "") {
                modifierValue = modifierValue + " " + lm;
            }
            if (nm != null && nm !== "") {
                modifierValue = modifierValue + " " + nm;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H/AF
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1) ||
            modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {
            modifierValue = "";
            let mw: string = "";
            let mar: string = "";

            if (modifiers.has(Modifiers.W_DTG_1))
                mw = modifiers.get(Modifiers.W_DTG_1);

            if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {

                mar = modifiers.get(Modifiers.AR_SPECIAL_DESIGNATOR);
            }


            modifierValue = mw + " " + mar;

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //above X/Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = null;
            let E: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G/AQ
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE) ||
            modifiers.has(Modifiers.AD_PLATFORM_TYPE) ||
            modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
            let mv: string;
            let
                mad: string;
            let
                mae: string;

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
                mv = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }
            if (modifiers.has(Modifiers.AD_PLATFORM_TYPE)) {
                mad = modifiers.get(Modifiers.AD_PLATFORM_TYPE);
            }
            if (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
                mae = modifiers.get(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
            }

            modifierValue = "";
            if (mv != null && mv !== "") {
                modifierValue = modifierValue + mv;
            }
            if (mad != null && mad !== "") {
                modifierValue = modifierValue + " " + mad;
            }
            if (mae != null && mae !== "") {
                modifierValue = modifierValue + " " + mae;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }



        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processLandEquipmentTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/


        //                                 C
        //            int y0 = 0;//W/           AS
        //            int y1 = 0;//X/Y          G/AQ
        //            int y2 = 0;//V/AD/AE      H/AF
        //            int y3 = 0;//T            M
        //            int y4 = 0;//Z            J/K/L/N/P
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        //if(Modifiers.C_QUANTITY in modifiers
        if (modifiers.has(Modifiers.C_QUANTITY)) {
            let text: string = modifiers.get(Modifiers.C_QUANTITY);
            if (text != null) {
                //bounds = armyc2.c5isr.renderer.utilities.RendererUtilities.getTextOutlineBounds(_modifierFont, text, new SO.Point(0,0));
                tiTemp = new TextInfo(text, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;
                x = Math.round((symbolBounds.getX() + (symbolBounds.getWidth() * 0.5)) - (labelWidth * 0.5)) as int;
                y = Math.round(symbolBounds.getY() - bufferY - descent) as int;
                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just above V/AD/AE
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {
            modifierValue = "";
            let mg: string = "";
            let maq: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                mg = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {

                maq = modifiers.get(Modifiers.AQ_GUARDED_UNIT);
            }


            modifierValue = mg + " " + maq;

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1) || modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            modifierValue = "";
            let hm: string = "";
            let
                afm: string = "";

            hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                hm = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }
            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
                afm = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }

            modifierValue = hm + " " + afm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just below V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //below T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent);
                y = Math.round(bounds.getY() + y) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.L_SIGNATURE_EQUIP)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                km: string;
            let
                lm: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.L_SIGNATURE_EQUIP) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.L_SIGNATURE_EQUIP)) {
                lm = modifiers.get(Modifiers.L_SIGNATURE_EQUIP);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + km;
            }
            if (lm != null && lm !== "") {
                modifierValue = modifierValue + " " + lm;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //above X/Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE) ||
            modifiers.has(Modifiers.AD_PLATFORM_TYPE) ||
            modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
            let mv: string;
            let
                mad: string;
            let
                mae: string;

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
                mv = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }
            if (modifiers.has(Modifiers.AD_PLATFORM_TYPE)) {
                mad = modifiers.get(Modifiers.AD_PLATFORM_TYPE);
            }
            if (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
                mae = modifiers.get(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);
            }

            modifierValue = "";
            if (mv != null && mv !== "") {
                modifierValue = modifierValue + mv;
            }
            if (mad != null && mad !== "") {
                modifierValue = modifierValue + " " + mad;
            }
            if (mae != null && mae !== "") {
                modifierValue = modifierValue + " " + mae;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.AS_COUNTRY) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = "";
            let E: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue += E;
            }

            if (AS != null && AS !== "") {
                modifierValue = modifierValue + " " + AS;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processLandInstallationTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();//new Array<TextInfo>(modifiers.size);

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //
        //            int y0 = 0;//
        //            int y1 = 0;//W            G
        //            int y2 = 0;//X/Y          H
        //            int y3 = 0;//T            J/K/P
        //            int y4 = 0;//
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = "";


            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just below V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                km: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = "";
            let mw: string = "";
            let mar: string = "";
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //above X/Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = null;
            let E: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) ||
            modifiers.has(Modifiers.Y_LOCATION)) {
            let mx: string;
            let
                my: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                mx = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                my = modifiers.get(Modifiers.Y_LOCATION);
            }


            modifierValue = "";
            if (mx != null && mx !== "") {
                modifierValue = modifierValue + mx;
            }
            if (my != null && my !== "") {
                modifierValue = modifierValue + " " + my;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processLandInstallationTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //
        //            int y0 = 0;// W            AS
        //            int y1 = 0;//X/Y           G/AQ
        //            int y2 = 0;//              H
        //            int y3 = 0;//AE            M
        //            int y4 = 0;//T             J/K/P
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) || modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {
            modifierValue = "";
            let mg: string = "";
            let maq: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                mg = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {

                maq = modifiers.get(Modifiers.AQ_GUARDED_UNIT);
            }


            modifierValue = mg + " " + maq;

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME)) {
            modifierValue = modifiers.get(Modifiers.AE_EQUIPMENT_TEARDOWN_TIME);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just below center
                y = (bounds.getY() + (bounds.getHeight() / 2 + labelHeight + (bufferText / 2) - descent)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //below AE
                y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 2))) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                km: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = "";
            let mw: string = "";
            let mar: string = "";
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.AS_COUNTRY) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = "";
            let E: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue += E;
            }

            if (AS != null && AS !== "") {
                modifierValue = modifierValue + " " + AS;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) ||
            modifiers.has(Modifiers.Y_LOCATION)) {
            let mx: string;
            let
                my: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                mx = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                my = modifiers.get(Modifiers.Y_LOCATION);
            }


            modifierValue = "";
            if (mx != null && mx !== "") {
                modifierValue = modifierValue + mx;
            }
            if (my != null && my !== "") {
                modifierValue = modifierValue + " " + my;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //above vertical center
                y = (bounds.getY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }



        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processDismountedIndividualsTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());


        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/


        //
        //            int y0 = 0;//W/           AS
        //            int y1 = 0;//X/Y          G
        //            int y2 = 0;//V/AF         H
        //            int y3 = 0;//T            M
        //            int y4 = 0;//Z            J/K/P
        //
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        //if(Modifiers.X_ALTITUDE_DEPTH in modifiers || Modifiers.Y_LOCATION in modifiers)
        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) || modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            let xm: string;
            let
                ym: string;

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                xm = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);// xm = modifiers.X;
            }
            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }
            if (xm == null && ym != null) {
                modifierValue = ym;
            }
            else {
                if (xm != null && ym == null) {
                    modifierValue = xm;
                }
                else {
                    if (xm != null && ym != null) {
                        modifierValue = xm + "  " + ym;
                    }
                }

            }


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just above V/AD/AE
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = null;


            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {

                modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }



            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = null;
            let hm: string = "";

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {

                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }



            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getX() - labelBounds.getWidth() - bufferXL) as int;
                //just below V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.Z_SPEED)) {
            modifierValue = modifiers.get(Modifiers.Z_SPEED);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //below T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() + y) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING)
            || modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.P_IFF_SIF_AIS))//
        {
            modifierValue = null;

            let jm: string;
            let
                km: string;
            let
                pm: string;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                jm = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }
            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.P_IFF_SIF_AIS) && SymbolUtilities.canSymbolHaveModifier(symbolID, Modifiers.P_IFF_SIF_AIS)) {
                pm = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = "";
            if (jm != null && jm !== "") {
                modifierValue = modifierValue + jm;
            }
            if (km != null && km !== "") {
                modifierValue = modifierValue + " " + km;
            }
            if (pm != null && pm !== "") {
                modifierValue = modifierValue + " " + pm;
            }

            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = null;

            modifierValue = modifiers.get(Modifiers.W_DTG_1);


            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //above X/Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE) ||
            modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
            let mv: string;
            let
                maf: string;

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
                mv = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }
            if (modifiers.has(Modifiers.AF_COMMON_IDENTIFIER)) {
                maf = modifiers.get(Modifiers.AF_COMMON_IDENTIFIER);
            }


            modifierValue = "";
            if (mv != null && mv !== "") {
                modifierValue = modifierValue + mv;
            }
            if (maf != null && maf !== "") {
                modifierValue = modifierValue + " " + maf;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;

                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.AS_COUNTRY) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
            modifierValue = "";
            let E: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue += E;
            }

            if (AS != null && AS !== "") {
                modifierValue = modifierValue + " " + AS;
            }

            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processSeaSurfaceTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //            int y0 = 0;//AQ/AR        E/T
        //            int y1 = 0;//              V
        //            int y2 =                   P
        //            int y3 = 0;//             G/H
        //            int y4 = 0;//             Y/Z
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = modifiers.get(Modifiers.V_EQUIP_TYPE);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just above P
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                modifierValue = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }



        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) ||
            modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = "";
            let mg: string = "";
            let
                mh: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
                mg += modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                mh += modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            modifierValue = mg + " " + mh;

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below P
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.Y_LOCATION)
            || modifiers.has(Modifiers.Z_SPEED))//
        {
            modifierValue = null;

            let ym: string = "";
            let
                zm: string = "";

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);
            }
            if (modifiers.has(Modifiers.Z_SPEED)) {
                zm = modifiers.get(Modifiers.Z_SPEED);
            }

            modifierValue = ym + " " + zm;

            modifierValue = modifierValue.trim();


            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below G/H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent);
                y = Math.round(bounds.getY() + y) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.AQ_GUARDED_UNIT) ||
            modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {
            modifierValue = null;

            let maq: string = "";
            let
                mar: string = "";
            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {

                maq = modifiers.get(Modifiers.AQ_GUARDED_UNIT);
            }


            if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {

                mar = modifiers.get(Modifiers.AR_SPECIAL_DESIGNATOR);
            }


            modifierValue = maq + " " + mar;
            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //across from T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;
                if (y <= bounds.getY() + labelHeight) //unless T is higher than top of the symbol
                {
                    y = bounds.getY() as int + labelHeight;
                }


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = null;
            let E: string;
            let
                T: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                T = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
            }


            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (T != null && T !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + T;
                }
                else {
                    modifierValue = T;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above V
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }



        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;

    }

    public static processSeaSurfaceTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //                                      E/AS
        //            int y0 = 0;//AQ/AR        T
        //            int y1 = 0;//              V
        //            int y2 =                   P
        //            int y3 = 0;//             G/H
        //            int y4 = 0;//             Y/Z
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = modifiers.get(Modifiers.V_EQUIP_TYPE);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above vertical center
                y = (bounds.getY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                modifierValue = modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below center
                y = (bounds.getY() + (bounds.getHeight() / 2 + labelHeight + (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }



        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) ||
            modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = "";
            let mg: string = "";
            let
                mh: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
                mg += modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                mh += modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            modifierValue = mg + " " + mh;

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below P
                y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 2))) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.Y_LOCATION)
            || modifiers.has(Modifiers.Z_SPEED))//
        {
            modifierValue = null;

            let ym: string = "";
            let
                zm: string = "";

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);
            }
            if (modifiers.has(Modifiers.Z_SPEED)) {
                zm = modifiers.get(Modifiers.Z_SPEED);
            }

            modifierValue = ym + " " + zm;

            modifierValue = modifierValue.trim();


            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below G/H
                y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight + bufferText) * 3)-descent)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.AQ_GUARDED_UNIT) ||
            modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {
            modifierValue = null;

            let maq: string = "";
            let
                mar: string = "";
            if (modifiers.has(Modifiers.AQ_GUARDED_UNIT)) {

                maq = modifiers.get(Modifiers.AQ_GUARDED_UNIT);
            }


            if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {

                mar = modifiers.get(Modifiers.AR_SPECIAL_DESIGNATOR);
            }


            modifierValue = maq + " " + mar;
            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //oppoiste AS unless that's higher than the top of the symbol
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - (labelHeight * 2))) as int;
                if (y <= bounds.getY() + labelHeight) {
                    y = bounds.getY() as int + labelHeight - descent;
                }


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }


            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (AS != null && AS !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + AS;
                }
                else {
                    modifierValue = AS;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above V
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - (labelHeight * 2))) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {

                modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
            }



            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above V
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;

    }

    public static processSeaSubSurfaceTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //            int y0 = 0;//AR           T
        //            int y1 = 0;//             V
        //            int y2 =                  X
        //            int y3 = 0;//             G
        //            int y4 = 0;//             H
        //

        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {

            let em: string = "";
            let tm: string = "";
            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {

                em = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }


            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {

                tm = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
            }


            modifierValue = em + " " + tm;
            modifierValue = modifierValue.trim();

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //on top
                y = (bounds.getMinY() + labelHeight - descent) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {

                modifierValue = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below T
                y = (bounds.getMinY() - descent + (labelHeight * 2)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
            modifierValue = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below V
                y = (bounds.getMinY() - descent + (labelHeight * 3)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below X
                y = (bounds.getMinY() - descent + (labelHeight * 4)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below G
                y = (bounds.getMinY() - descent + (labelHeight * 5)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {

                modifierValue = modifiers.get(Modifiers.AR_SPECIAL_DESIGNATOR);
            }


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //on top
                y = (bounds.getMinY() + labelHeight - descent) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processSeaSubSurfaceTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //                                      E/AS
        //            int y0 = 0;//AQ/AR        T
        //            int y1 = 0;//              V
        //            int y2 =                   P
        //            int y3 = 0;//             G/H
        //            int y4 = 0;//             Y/Z
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) 
        {
            modifierValue = null;
            let E: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }


            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (AS != null && AS !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + AS;
                }
                else {
                    modifierValue = AS;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above V
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                //y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - (labelHeight * 2))) as int;
                y = (bounds.getMinY() + labelHeight - descent) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {

                modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
            }



            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above V
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                //y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;
                y = (bounds.getMinY() + (labelHeight*2) - descent) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = modifiers.get(Modifiers.V_EQUIP_TYPE);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //above vertical center
                //y = (bounds.getY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;
                y = (bounds.getMinY() + (labelHeight*3) - descent) as int;
                

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH) ||
            modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
            modifierValue = "";
            let mx: string = "";
            let
                mp: string = "";

            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                modifierValue = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
            }

            if (modifiers.has(Modifiers.P_IFF_SIF_AIS)) {
                modifierValue += " " + modifiers.get(Modifiers.P_IFF_SIF_AIS);
            }

            modifierValue = modifierValue.trim();


            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //just below center
                //y = (bounds.getY() + (bounds.getHeight() / 2 + labelHeight + (bufferText / 2) - descent)) as int;
                y = (bounds.getMinY() + (labelHeight*4) - descent) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }



        if (modifiers.has(Modifiers.G_STAFF_COMMENTS) ||
            modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = "";
            let mg: string = "";
            let
                mh: string = "";

            if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
                mg += modifiers.get(Modifiers.G_STAFF_COMMENTS);
            }

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                mh += modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            modifierValue = mg + " " + mh;

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below P
                //y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 2))) as int;
                y = (bounds.getMinY() + (labelHeight*5) - descent) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.Y_LOCATION)
            || modifiers.has(Modifiers.Z_SPEED))//
        {
            modifierValue = null;

            let ym: string = "";
            let
                zm: string = "";

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                ym = modifiers.get(Modifiers.Y_LOCATION);
            }
            if (modifiers.has(Modifiers.Z_SPEED)) {
                zm = modifiers.get(Modifiers.Z_SPEED);
            }

            modifierValue = ym + " " + zm;

            modifierValue = modifierValue.trim();


            if (modifierValue.length > 2 && modifierValue.charAt(0) === ' ') {
                modifierValue = modifierValue.substring(1);
            }

            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getX() + bounds.getWidth() + bufferXR) as int;
                //below G/H
                //y = (bounds.getY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 3))) as int;
                y = (bounds.getMinY() + (labelHeight*6) - descent) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.AR_SPECIAL_DESIGNATOR)) {
            modifierValue = modifiers.get(Modifiers.AR_SPECIAL_DESIGNATOR);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on left
                x = (bounds.getX() - labelWidth - bufferXL) as int;
                //oppoiste AS unless that's higher than the top of the symbol
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - (labelHeight * 2))) as int;
                if (y <= bounds.getY() + labelHeight) {
                    y = bounds.getY() as int + labelHeight - descent;
                }


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }



        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processActivitiesTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//W            E/AS
        //            int y1 = 0;//Y            G
        //            int y2 =                  H
        //            int y3 = 0;//             J
        //            int y4 = 0;//
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        if (modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                modifierValue = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getMinX() - labelBounds.getWidth() - bufferXL) as int;
                y = (bounds.getMinY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //just above center
                y = (bounds.getMinY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //just below center
                y = (bounds.getMinY() + (bounds.getHeight() / 2 + labelHeight + (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING))//
        {
            modifierValue = null;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                modifierValue = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }


            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below H
                y = (bounds.getMinY() + ((bounds.getHeight() / 2) + ((labelHeight - descent + bufferText) * 2))) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //above Y on left
                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string = "";
            let
                AS: string = "";

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            modifierValue = E + " " + AS;
            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processActivitiesTextModifiersE(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//W            E/AS
        //            int y1 = 0;//Y            T
        //            int y2 =                  G
        //            int y3 = 0;//             H
        //            int y4 = 0;//             J
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        if (modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                modifierValue = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getMinX() - labelBounds.getWidth() - bufferXL) as int;
                y = (bounds.getMinY() + ((bounds.getHeight() / 2) - (bufferText / 2) - descent)) as int;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
            modifierValue = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //T just above G (center)
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //G centered
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //H just below G (center)
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.J_EVALUATION_RATING))//
        {
            modifierValue = null;

            if (modifiers.has(Modifiers.J_EVALUATION_RATING)) {
                modifierValue = modifiers.get(Modifiers.J_EVALUATION_RATING);
            }


            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //J below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getY() as int + y);


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //above Y on left
                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //y = (int)(bounds.getY() + ((bounds.getHeight() / 2) - (labelHeight - bufferText) ));//android
                y = (bounds.getY() + ((bounds.getHeight() / 2) - bufferText - descent - labelHeight)) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string = "";
            let
                AS: string = "";

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            modifierValue = E + " " + AS;
            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //AS above T
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static processCyberSpaceTextModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 7;
        let bufferXR: int = 7;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let x: int = 0;
        let y: int = 0;//best y

        let newsdi: SymbolDimensionInfo;
        let alpha: float = -1;

        let textColor: Color = Color.BLACK;
        let textBackgroundColor: Color;

        let tiArray: Array<TextInfo> = new Array<TextInfo>();

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;

        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let labelBounds: Rectangle2D;
        let labelWidth: int = 0;
        let labelHeight: int = 0;

        let bounds: Rectangle2D = sdi.getSymbolBounds();
        let symbolBounds: Rectangle2D = (sdi.getSymbolBounds().clone()) as Rectangle2D;
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();
        let imageBoundsOld: Rectangle2D = imageBounds.clone() as Rectangle2D;

        let echelonText: string = SymbolUtilities.getEchelonText(SymbolID.getAmplifierDescriptor(symbolID));
        let amText: string = SymbolUtilities.getStandardIdentityModifier(symbolID);

        //adjust width of bounds for mobility/echelon/engagement bar which could be wider than the symbol
        bounds = RectUtilities.toRectangle2D(imageBounds.getX(), bounds.getY(), imageBounds.getWidth(), bounds.getHeight());



        //check if text is too tall:
        let byLabelHeight: boolean = true;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;/* RendererUtilities.measureTextHeight(RendererSettings.getModifierFontName(),
         RendererSettings.getModifierFontSize(),
         RendererSettings.getModifierFontStyle()).fullHeight;*/

        let maxHeight: int = (bounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        //Affiliation Modifier being drawn as a display modifier
        let affiliationModifier: string;
        if (ModifierRenderer.RS.getDrawAffiliationModifierAsLabel() === true) {
            affiliationModifier = SymbolUtilities.getStandardIdentityModifier(symbolID);
        }
        if (affiliationModifier != null) {   //Set affiliation modifier
            modifiers.set(Modifiers.E_FRAME_SHAPE_MODIFIER, affiliationModifier);
            //modifiers[Modifiers.E_FRAME_SHAPE_MODIFIER] = affiliationModifier;
        }//*/

        //Check for Valid Country Code
        let cc: string = GENCLookup.getInstance().get3CharCode(SymbolID.getCountryCode(symbolID));
        if (cc != null && cc !== "") {
            modifiers.set(Modifiers.AS_COUNTRY, cc);
            //modifiers[Modifiers.CC_COUNTRY_CODE] = symbolID.substring(12,14);
        }

        //            int y0 = 0;//             E/F/AS
        //            int y1 = 0;//W            G
        //            int y2 =     Y            H
        //            int y3 = 0;//T/V          M
        //            int y4 = 0;//             K/L
        // <editor-fold defaultstate="collapsed" desc="Build Modifiers">
        let modifierValue: string;
        let tiTemp: TextInfo;


        if (modifiers.has(Modifiers.Y_LOCATION)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.Y_LOCATION)) {
                modifierValue = modifiers.get(Modifiers.Y_LOCATION);// ym = modifiers.Y;
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getMinY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.G_STAFF_COMMENTS)) {
            modifierValue = modifiers.get(Modifiers.G_STAFF_COMMENTS);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //on right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //just above H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getMinY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
            modifierValue = null;

            if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                modifierValue = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
            }

            if (modifierValue != null && modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //center
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + ((labelHeight - descent) * 0.5)) as int;
                y = bounds.getMinY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1) ||
            modifiers.has(Modifiers.V_EQUIP_TYPE)) {
            modifierValue = "";

            let mt: string = "";
            let
                mv: string = "";

            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {

                mt = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
            }


            if (modifiers.has(Modifiers.V_EQUIP_TYPE)) {

                mv = modifiers.get(Modifiers.V_EQUIP_TYPE);
            }


            modifierValue = mt + " " + mv;
            modifierValue = modifierValue.trim();

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //just below center on left
                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //just below Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getMinY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
            modifierValue = "";

            if (modifiers.has(Modifiers.M_HIGHER_FORMATION)) {
                modifierValue += modifiers.get(Modifiers.M_HIGHER_FORMATION);
            }

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //just below H
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText - descent));
                y = bounds.getMinY() as int + y;

                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }

        if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)//
            || modifiers.has(Modifiers.L_SIGNATURE_EQUIP))//
        {
            modifierValue = null;

            let km: string;
            let
                lm: string;

            if (modifiers.has(Modifiers.K_COMBAT_EFFECTIVENESS)) {
                km = modifiers.get(Modifiers.K_COMBAT_EFFECTIVENESS);
            }
            if (modifiers.has(Modifiers.L_SIGNATURE_EQUIP)) {
                lm = modifiers.get(Modifiers.L_SIGNATURE_EQUIP);
            }

            modifierValue = km + " " + lm;
            modifierValue = modifierValue.trim();

            if (modifierValue !== "") {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //below M
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y + ((labelHeight + bufferText) * 2) - (descent * 2);
                y = Math.round(bounds.getMinY() + y) as int;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }

        }

        if (modifiers.has(Modifiers.W_DTG_1)) {
            modifierValue = modifiers.get(Modifiers.W_DTG_1);

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //above X/Y on left
                x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                //just above Y
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText));
                y = bounds.getMinY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);
            }
        }

        if (modifiers.has(Modifiers.F_REINFORCED_REDUCED) ||
            modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER) ||
            modifiers.has(Modifiers.AS_COUNTRY)) {
            modifierValue = null;
            let E: string;
            let
                F: string;
            let
                AS: string;

            if (modifiers.has(Modifiers.E_FRAME_SHAPE_MODIFIER)) {
                E = modifiers.get(Modifiers.E_FRAME_SHAPE_MODIFIER);
                modifiers.delete(Modifiers.E_FRAME_SHAPE_MODIFIER);
            }
            if (modifiers.has(Modifiers.F_REINFORCED_REDUCED)) {
                F = modifiers.get(Modifiers.F_REINFORCED_REDUCED);
            }
            if (modifiers.has(Modifiers.AS_COUNTRY)) {
                AS = modifiers.get(Modifiers.AS_COUNTRY);
            }

            if (E != null && E !== "") {
                modifierValue = E;
            }

            if (F != null && F !== "") {
                if (F.toUpperCase() === ("R")) {
                    F = "(+)";
                }
                else {
                    if (F.toUpperCase() === ("D")) {
                        F = "(-)";
                    }
                    else {
                        if (F.toUpperCase() === ("RD")) {
                            F = "(" + String.fromCharCode(177) + ")";
                        }
                    }

                }

            }

            if (F != null && F !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + F;
                }
                else {
                    modifierValue = F;
                }
            }

            if (AS != null && AS !== "") {
                if (modifierValue != null && modifierValue !== "") {
                    modifierValue = modifierValue + " " + AS;
                }
                else {
                    modifierValue = AS;
                }
            }

            if (modifierValue != null) {
                tiTemp = new TextInfo(modifierValue, 0, 0, ModifierRenderer._modifierFont, frc);
                labelBounds = tiTemp.getTextBounds();
                labelWidth = labelBounds.getWidth() as int;

                //right
                x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                //above G
                y = (bounds.getHeight()) as int;
                y = ((y * 0.5) + (labelHeight * 0.5)) as int;
                y = y - ((labelHeight + bufferText) * 2);
                y = bounds.getMinY() as int + y;


                tiTemp.setLocation(x, y);
                tiArray.push(tiTemp);

            }
        }


        // </editor-fold>

        //Shift Points and Draw
        newsdi = ModifierRenderer.shiftUnitPointsAndDraw(tiArray,sdi,attributes);

        // <editor-fold defaultstate="collapsed" desc="Cleanup">
        tiArray = null;
        tiTemp = null;
        //tempShape = null;
        imageBoundsOld = null;
        //ctx = null;
        //buffer = null;
        // </editor-fold>

        return newsdi;
    }

    public static ProcessTGSPWithSpecialModifierLayout(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, lineColor: Color, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo | null {

        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 6;
        let bufferXR: int = 4;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let centerOffset: int = 1; //getCenterX/Y function seems to go over by a pixel
        let x: int = 0;
        let y: int = 0;
        let x2: int = 0;
        let y2: int = 0;

        let outlineOffset: int = ModifierRenderer.RS.getTextOutlineWidth();
        let labelHeight: int = 0;
        let labelWidth: int = 0;
        let strokeWidth: float = 2.0;
        let alpha: float = -1;
        let newsdi: SymbolDimensionInfo;
        let textColor: Color = lineColor;
        let textBackgroundColor: Color;
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let ec: int = SymbolID.getEntityCode(symbolID);
        let e: int = SymbolID.getEntity(symbolID);
        let et: int = SymbolID.getEntityType(symbolID);
        let est: int = SymbolID.getEntitySubtype(symbolID);

        //Feint Dummy Indicator variables
        let fdiBounds: Rectangle2D;
        let fdiTop: Point2D;
        let fdiLeft: Point2D;
        let fdiRight: Point2D;

        let arrMods: Array<TextInfo> = new Array<TextInfo>();
        let duplicate: boolean = false;

        let bounds: Rectangle2D = RectUtilities.copyRect(sdi.getSymbolBounds());
        let symbolBounds: Rectangle2D = RectUtilities.copyRect(sdi.getSymbolBounds());
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = sdi.getImageBounds().clone();

        if(attributes != null)
        {    
            if (attributes.has(MilStdAttributes.PixelSize)) {
                let pixelSize: int = parseInt(attributes.get(MilStdAttributes.PixelSize));
                if (pixelSize <= 100) {

                    strokeWidth = 2.0;
                }

                else {

                    strokeWidth = 2 + ((pixelSize - 100) / 100);
                }

            }

            if (attributes.has(MilStdAttributes.Alpha)) {
                alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
            }
        }

        

        centerPoint = new Point2D(Math.round(sdi.getSymbolCenterPoint().x), Math.round(sdi.getSymbolCenterPoint().y));

        let byLabelHeight: boolean = false;
        labelHeight = (ModifierRenderer._modifierFontHeight + 0.5) as int;

        let maxHeight: int = (symbolBounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;
        let yForY: int = -1;

        let labelBounds1: Rectangle2D;//text.getPixelBounds(null, 0, 0);
        let labelBounds2: Rectangle2D;
        let strText: string = "";
        let strText1: string = "";
        let strText2: string = "";
        let text1: TextInfo;
        let text2: TextInfo;


        if (outlineOffset > 2) {
            outlineOffset = ((outlineOffset - 1) / 2);
        }
        else {
            outlineOffset = 0;
        }


        // <editor-fold defaultstate="collapsed" desc="Process Special Modifiers">
        let ti: TextInfo;
        if (SymbolUtilities.isCBRNEvent(symbolID))//chemical
        {
            if ((labelHeight * 3) > bounds.getHeight()) {
                byLabelHeight = true;
            }
        }

        if (ss === SymbolID.SymbolSet_ControlMeasure && modifiers != null && modifiers.size > 0) {
            if (ec === 130500 //contact point
                || ec === 130700) //decision point
            {
                if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                    strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                    if (strText != null) {
                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                        //One modifier symbols and modifier goes in center
                        x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                        x = x - (labelWidth * 0.5) as int;
                        y = (bounds.getMinY() + (bounds.getHeight() * 0.4) as int) as int;
                        y = y + (labelHeight * 0.5) as int;

                        ti.setLocation(Math.round(x), Math.round(y));
                        arrMods.push(ti);
                    }
                }
            } else {
                if (ec === 212800)//harbor
                {
                    if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                        strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                        if (strText != null) {
                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                            labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                            //One modifier symbols and modifier goes in center
                            x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                            x = x - (labelWidth * 0.5) as int;
                            y = (bounds.getMinY() + (bounds.getHeight() * 0.5) as int) as int;
                            y = y + (labelHeight * 0.5) as int;

                            ti.setLocation(Math.round(x), Math.round(y));
                            arrMods.push(ti);
                        }
                    }
                } else {
                    if (ec === 131300)//point of interest
                    {
                        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                            strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                            if (strText != null) {
                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                //One modifier symbols, top third & center
                                x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                                x = x - (labelWidth * 0.5) as int;
                                y = (bounds.getMinY() + (bounds.getHeight() * 0.25) as int) as int;
                                y = y + (labelHeight * 0.5) as int;

                                ti.setLocation(Math.round(x), Math.round(y));
                                arrMods.push(ti);
                            }
                        }
                    } else {
                        if (ec === 131800//waypoint
                            || ec === 240900)//fire support station
                        {
                            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                if (strText != null) {
                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                    //One modifier symbols and modifier goes right of center
                                    if (ec === 131800) {

                                        x = (bounds.getMinX() + (bounds.getWidth() * 0.75)) as int;
                                    }

                                    else {

                                        x = (bounds.getMinX() + (bounds.getWidth())) as int;
                                    }

                                    y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                                    y = y + ((labelHeight - descent) * 0.5) as int;

                                    ti.setLocation(Math.round(x), Math.round(y));
                                    arrMods.push(ti);
                                }
                            }
                        }
                        else {
                            if (ec === 131900)  //Airfield (AEGIS Only)
                            {
                                if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                    strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                    if (strText != null) {
                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                        //One modifier symbols and modifier goes right of center
                                        x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;

                                        y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                                        y = y + ((labelHeight - descent) * 0.5) as int;

                                        ti.setLocation(Math.round(x), Math.round(y));
                                        arrMods.push(ti);
                                    }
                                }
                            } else {
                                if (ec === 180100 //Air Control point
                                    || ec === 180200) //Communications Check point
                                {
                                    if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                        strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                        if (strText != null) {
                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                            labelWidth = ti.getTextBounds().getWidth() as int;
                                            //One modifier symbols and modifier goes just below of center
                                            x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                                            x = x - (labelWidth * 0.5) as int;
                                            y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                                            y = y + (((bounds.getHeight() * 0.5) - labelHeight) / 2) as int + labelHeight - descent;

                                            ti.setLocation(Math.round(x), Math.round(y));
                                            arrMods.push(ti);
                                        }
                                    }
                                } else {
                                    if (ec === 160300 || //T (target reference point)
                                        ec === 132000 || //T (Target Handover)
                                        ec === 240601 || //ap,ap1,x,h (Point/Single Target)
                                        ec === 240602) //T (nuclear target)
                                    { //Targets with special modifier positions
                                        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)
                                            && ec === 240601)//H //point single target
                                        {
                                            strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                            if (strText != null) {
                                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                x = (bounds.getCenterX() + (bounds.getWidth() * 0.15)) as int;
                                                y = (bounds.getMinY() + (bounds.getHeight() * 0.75)) as int;
                                                y = y + (labelHeight * 0.5) as int;

                                                ti.setLocation(Math.round(x), Math.round(y));
                                                arrMods.push(ti);
                                            }
                                        }
                                        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)
                                            && ec === 240601)//X point or single target
                                        {
                                            strText = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
                                            if (strText != null) {
                                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                x = (bounds.getCenterX() - (bounds.getWidth() * 0.15) as int) as int;
                                                x = x - (labelWidth);
                                                y = (bounds.getMinY() + (bounds.getHeight() * 0.75)) as int;
                                                y = y + (labelHeight * 0.5) as int;

                                                ti.setLocation(Math.round(x), Math.round(y));
                                                arrMods.push(ti);
                                            }
                                        }
                                        if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1) &&
                                            (ec === 160300 || ec === 132000)) {
                                            strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                        }
                                        if (ec === 240601 || ec === 240602) {
                                            if (modifiers.has(Modifiers.AP_TARGET_NUMBER)) {
                                                strText = modifiers.get(Modifiers.AP_TARGET_NUMBER);
                                            }
                                            if (ec === 240601 && modifiers.has(Modifiers.AP1_TARGET_NUMBER_EXTENSION)) {
                                                if (strText != null) {

                                                    strText = strText + "  " + modifiers.get(Modifiers.AP1_TARGET_NUMBER_EXTENSION);
                                                }

                                                else {

                                                    strText = modifiers.get(Modifiers.AP1_TARGET_NUMBER_EXTENSION);
                                                }

                                            }
                                        }


                                        if (strText != null) {
                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                            x = (bounds.getCenterX() + (bounds.getWidth() * 0.15)) as int;
                                            //                  x = x - (labelbounds.getWidth * 0.5);
                                            y = (bounds.getMinY() + (bounds.getHeight() * 0.25)) as int;
                                            y = y + (labelHeight * 0.5) as int;

                                            ti.setLocation(Math.round(x), Math.round(y));
                                            arrMods.push(ti);
                                        }


                                    }
                                    else {
                                        if (ec === 132100)  //Key Terrain
                                        {
                                            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                if (strText != null) {
                                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                    //One modifier symbols and modifier goes right of center
                                                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5 + bufferXR)) as int;

                                                    y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                                                    y = y + ((labelHeight - descent) * 0.5) as int;

                                                    ti.setLocation(Math.round(x), Math.round(y));
                                                    arrMods.push(ti);
                                                }
                                            }
                                        }
                                        else {
                                            if (SymbolUtilities.isCBRNEvent(symbolID)) //CBRN
                                            {
                                                if (modifiers.has(Modifiers.N_HOSTILE)) {
                                                    strText = modifiers.get(Modifiers.N_HOSTILE);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                        x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;

                                                        if (!byLabelHeight) {
                                                            y = (bounds.getMinY() + bounds.getHeight()) as int;
                                                        } else {
                                                            y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) + ((labelHeight - descent) * 0.5) + (labelHeight - descent + bufferText))) as int;
                                                        }

                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }

                                                }
                                                if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                                                    strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                        x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                                                        if (!byLabelHeight) {
                                                            y = (bounds.getMinY() + labelHeight - descent) as int;
                                                        } else {
                                                            //y = bounds.y + ((bounds.getHeight * 0.5) + (labelHeight * 0.5) - (labelHeight + bufferText));
                                                            y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) - ((labelHeight - descent) * 0.5) + (-descent - bufferText))) as int;
                                                        }

                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }
                                                }
                                                if (modifiers.has(Modifiers.W_DTG_1)) {
                                                    strText = modifiers.get(Modifiers.W_DTG_1);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                                                        x = bounds.getMinX() as int - labelWidth - bufferXL;
                                                        if (!byLabelHeight) {
                                                            y = bounds.getMinY() as int + labelHeight - descent;
                                                        } else {
                                                            //y = bounds.y + ((bounds.getHeight * 0.5) + (labelHeight * 0.5) - (labelHeight + bufferText));
                                                            y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) - ((labelHeight - descent) * 0.5) + (-descent - bufferText))) as int;
                                                        }

                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }
                                                }
                                                if ((ec === 281500 || ec === 281600) && modifiers.has(Modifiers.V_EQUIP_TYPE)) {//nuclear event or nuclear fallout producing event
                                                    strText = modifiers.get(Modifiers.V_EQUIP_TYPE);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                        //subset of nbc, just nuclear
                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                        x = bounds.getMinX() as int - labelWidth - bufferXL;
                                                        y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) + ((labelHeight - descent) * 0.5))) as int;//((bounds.getHeight / 2) - (labelHeight/2));

                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }
                                                }
                                                if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                    strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                        x = bounds.getMinX() as int - labelWidth - bufferXL;
                                                        if (!byLabelHeight) {
                                                            y = (bounds.getMinY() + bounds.getHeight()) as int;
                                                        } else {
                                                            //y = bounds.y + ((bounds.getHeight * 0.5) + ((labelHeight-descent) * 0.5) + (labelHeight + bufferText));
                                                            y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) + ((labelHeight - descent) * 0.5) + (labelHeight - descent + bufferText))) as int;
                                                        }
                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }
                                                }
                                                if (modifiers.has(Modifiers.Y_LOCATION)) {
                                                    strText = modifiers.get(Modifiers.Y_LOCATION);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                        //just NBC
                                                        //x = bounds.getX() + (bounds.getWidth() * 0.5);
                                                        //x = x - (labelWidth * 0.5);
                                                        x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                                                        x = x - (labelWidth * 0.5) as int;

                                                        if (!byLabelHeight) {
                                                            y = (bounds.getMinY() + bounds.getHeight() + labelHeight - descent + bufferY) as int;
                                                        } else {
                                                            y = (bounds.getMinY() + ((bounds.getHeight() * 0.5) + ((labelHeight - descent) * 0.5) + ((labelHeight + bufferText) * 2) - descent) as int) as int;

                                                        }
                                                        yForY = y + descent; //so we know where to start the DOM arrow.
                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }

                                                }
                                                if (modifiers.has(Modifiers.C_QUANTITY)) {
                                                    strText = modifiers.get(Modifiers.C_QUANTITY);
                                                    if (strText != null) {
                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                        //subset of NBC, just nuclear
                                                        x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                                                        x = x - (labelWidth * 0.5) as int;
                                                        y = bounds.getMinY() as int - descent;
                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                        arrMods.push(ti);
                                                    }

                                                }
                                            }
                                            else {
                                                if (ec === 270701)//static depiction
                                                {
                                                    if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                                                        strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                                        if (strText != null) {
                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                            labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                            x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                                                            x = x - (labelWidth * 0.5) as int;
                                                            y = bounds.getMinY() as int - descent;// + (bounds.getHeight * 0.5);
                                                            //y = y + (labelHeight * 0.5);

                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                            arrMods.push(ti);
                                                        }

                                                    }
                                                    if (modifiers.has(Modifiers.W_DTG_1)) {
                                                        strText = modifiers.get(Modifiers.W_DTG_1);
                                                        if (strText != null) {
                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                            labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                            x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                                                            x = x - (labelWidth * 0.5) as int;
                                                            y = (bounds.getMinY() + (bounds.getHeight())) as int;
                                                            y = y + (labelHeight);

                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                            arrMods.push(ti);
                                                        }
                                                    }
                                                    if (modifiers.has(Modifiers.N_HOSTILE)) {
                                                        strText = modifiers.get(Modifiers.N_HOSTILE);
                                                        if (strText != null) {
                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                            let ti2: TextInfo = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                            labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                            x = (bounds.getMinX() + (bounds.getWidth()) + bufferXR) as int;//right
                                                            //x = x + labelWidth;//- (labelbounds.getWidth * 0.75);

                                                            duplicate = true;

                                                            x2 = bounds.getMinX() as int;//left
                                                            x2 = x2 - labelWidth - bufferXL;// - (labelbounds.getWidth * 0.25);

                                                            y = (bounds.getMinY() + (bounds.getHeight() * 0.5) as int) as int;//center
                                                            y = y + ((labelHeight - descent) * 0.5) as int;

                                                            y2 = y;

                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                            ti2.setLocation(Math.round(x2), Math.round(y2));
                                                            arrMods.push(ti);
                                                            arrMods.push(ti2);
                                                        }
                                                    }

                                                }
                                                else {
                                                    if (e === 21 && et === 35)//sonobuoys
                                                    {
                                                        //H sitting on center of circle to the right
                                                        //T above H
                                                        centerPoint = SymbolUtilities.getCMSymbolAnchorPoint(symbolID, RectUtilities.copyRect(bounds)).toPoint2D();
                                                        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                                                            strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                                            if (strText != null) {
                                                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                                let ti2: TextInfo = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                                labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                                x = (bounds.getMinX() + (bounds.getWidth()) + bufferXR) as int;//right
                                                                y = centerPoint.y;

                                                                ti.setLocation(Math.round(x), Math.round(y));
                                                                arrMods.push(ti);
                                                            }
                                                        }
                                                        if (est === 0 || est === 1 || est === 4 || est === 7 || est === 8 || est === 15) {
                                                            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                                strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                                if (strText != null) {
                                                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                                    let ti2: TextInfo = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                                    x = (bounds.getMinX() + (bounds.getWidth()) + bufferXR) as int;//right
                                                                    y = centerPoint.y - labelHeight;

                                                                    ti.setLocation(Math.round(x), Math.round(y));
                                                                    arrMods.push(ti);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (ec === 282001 || //tower, low
                                                            ec === 282002)   //tower, high
                                                        {
                                                            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                                                                strText = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
                                                                if (strText != null) {
                                                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                                                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                                    x = (bounds.getMinX() + (bounds.getWidth() * 0.7)) as int;
                                                                    y = bounds.getMinY() as int + labelHeight;// + (bounds.getHeight * 0.5);
                                                                    //y = y + (labelHeight * 0.5);

                                                                    ti.setLocation(Math.round(x), Math.round(y));
                                                                    arrMods.push(ti);
                                                                }

                                                            }
                                                        }
                                                        else {
                                                            if (ec === 21060)  //TACAN
                                                            {
                                                                if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                                    strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                                    if (strText != null) {
                                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                        //One modifier symbols and modifier goes top right of symbol
                                                                        x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;

                                                                        y = (bounds.getMinY() + labelHeight) as int;


                                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                                        arrMods.push(ti);
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                if (ec === 210300)  //Defended Asset
                                                                {
                                                                    if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                                        strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                                        if (strText != null) {
                                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                            //One modifier symbols and modifier goes top right of symbol
                                                                            x = (bounds.getMinX() - labelWidth - bufferXL) as int;

                                                                            y = (bounds.getMinY() + labelHeight) as int;


                                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                                            arrMods.push(ti);
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    if (ec === 21060)  //Air Detonation
                                                                    {
                                                                        if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                                                                            strText = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
                                                                            if (strText != null) {
                                                                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                //One modifier symbols and modifier goes top right of symbol
                                                                                x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;

                                                                                y = (bounds.getMinY() + labelHeight) as int;


                                                                                ti.setLocation(Math.round(x), Math.round(y));
                                                                                arrMods.push(ti);
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        if (ec === 210800)  //Impact Point
                                                                        {
                                                                            if (modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {
                                                                                strText = modifiers.get(Modifiers.X_ALTITUDE_DEPTH);
                                                                                if (strText != null) {
                                                                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                    //One modifier symbols and modifier goes upper right of center
                                                                                    x = (bounds.getX() + (bounds.getWidth() * 0.65)) as int;
                                                                                    //                  x = x - (labelBounds.width * 0.5);
                                                                                    y = (bounds.getY() + (bounds.getHeight() * 0.25)) as int;
                                                                                    y = y + (labelHeight * 0.5) as int;


                                                                                    ti.setLocation(Math.round(x), Math.round(y));
                                                                                    arrMods.push(ti);
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            if (ec === 211000)  //Launched Torpedo
                                                                            {
                                                                                if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                                                                                    strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                                                                    if (strText != null) {
                                                                                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                        //One modifier symbols and modifier goes upper right of center
                                                                                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                                                        x = (bounds.getX() + (bounds.getWidth() * 0.5) - (labelWidth / 2)) as int;
                                                                                        y = (bounds.getY() - bufferY) as int;


                                                                                        ti.setLocation(Math.round(x), Math.round(y));
                                                                                        arrMods.push(ti);
                                                                                    }
                                                                                }
                                                                            }
                                                                            else {
                                                                                if (ec === 214900 || ec === 215600)//General Sea SubSurface Station & General Sea Surface Station
                                                                                {
                                                                                    if (modifiers.has(Modifiers.W_DTG_1)) {
                                                                                        strText = modifiers.get(Modifiers.W_DTG_1);
                                                                                        if (strText != null) {
                                                                                            ti = new TextInfo(strText + " - ", 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                            //One modifier symbols and modifier goes top right of symbol
                                                                                            x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;
                                                                                            y = (bounds.getMinY() + labelHeight) as int;

                                                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                                                            arrMods.push(ti);
                                                                                        }
                                                                                    }
                                                                                    if (modifiers.has(Modifiers.W1_DTG_2)) {
                                                                                        strText = modifiers.get(Modifiers.W1_DTG_2);
                                                                                        if (strText != null) {
                                                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                            //One modifier symbols and modifier goes top right of symbol
                                                                                            x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;
                                                                                            y = (bounds.getMinY() + (labelHeight * 2)) as int;

                                                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                                                            arrMods.push(ti);
                                                                                        }
                                                                                    }
                                                                                    if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                                                        strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                                                        if (strText != null) {
                                                                                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                            //One modifier symbols and modifier goes top right of symbol
                                                                                            x = (bounds.getMinX() + (bounds.getWidth() + bufferXR)) as int;
                                                                                            y = (bounds.getMinY() + (labelHeight * 3)) as int;

                                                                                            ti.setLocation(Math.round(x), Math.round(y));
                                                                                            arrMods.push(ti);
                                                                                        }
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    if (ec === 217000)//Shore Control Station
                                                                                    {
                                                                                        if (modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                                                                                            strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                                                                                            if (strText != null) {
                                                                                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                                //One modifier symbols and modifier goes upper right of center
                                                                                                labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                                                                                x = (bounds.getX() + (bounds.getWidth() * 0.5) - (labelWidth / 2)) as int;
                                                                                                y = (bounds.getY() + bounds.getHeight() + labelHeight + bufferY) as int;


                                                                                                ti.setLocation(Math.round(x), Math.round(y));
                                                                                                arrMods.push(ti);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        if (ec === 250600)//Known Point
                                                                                        {
                                                                                            if (modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                                                                                                strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                                                                                                if (strText != null) {
                                                                                                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                                                                                                    //One modifier symbols and modifier goes upper right of center
                                                                                                    x = (bounds.getX() + (bounds.getWidth() + bufferXR)) as int;
                                                                                                    //                  x = x - (labelBounds.width * 0.5);
                                                                                                    y = (bounds.getY() + (bounds.getHeight() * 0.25)) as int;
                                                                                                    y = y + (labelHeight * 0.5) as int;


                                                                                                    ti.setLocation(Math.round(x), Math.round(y));
                                                                                                    arrMods.push(ti);
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                }

                                                                            }

                                                                        }

                                                                    }

                                                                }

                                                            }

                                                        }

                                                    }

                                                }

                                            }

                                        }

                                    }

                                }

                            }

                        }

                    }

                }

            }

        }
        else {
            if (ss === SymbolID.SymbolSet_Atmospheric) {
                let modX: string;
                if (modifiers != null && modifiers.has(Modifiers.X_ALTITUDE_DEPTH)) {

                    modX = (modifiers.get(Modifiers.X_ALTITUDE_DEPTH));
                }


                if (ec === 162300)//Freezing Level
                {
                    strText = "0" + String.fromCharCode(176) + ":";
                    if (modX != null) {

                        strText += modX;
                    }

                    else {

                        strText += "?";
                    }


                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                    //One modifier symbols and modifier goes in center
                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                    x = x - (labelWidth * 0.5) as int;
                    y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                    y = y + ((labelHeight - ModifierRenderer._modifierFontDescent) * 0.5) as int;

                    ti.setLocation(Math.round(x), Math.round(y));
                    arrMods.push(ti);
                }
                else {
                    if (ec === 162200)//tropopause Level
                    {
                        strText = "X?";
                        if (modX != null) {

                            strText = modX;
                        }


                        ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                        labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                        //One modifier symbols and modifier goes in center
                        x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                        x = x - (labelWidth * 0.5) as int;
                        y = (bounds.getMinY() + (bounds.getHeight() * 0.5)) as int;
                        y = y + ((labelHeight - ModifierRenderer._modifierFontDescent) * 0.5) as int;

                        ti.setLocation(Math.round(x), Math.round(y));
                        arrMods.push(ti);
                    }
                    else {
                        if (ec === 110102)//tropopause Low
                        {
                            strText = "X?";
                            if (modX != null) {

                                strText = modX;
                            }


                            ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                            labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                            //One modifier symbols and modifier goes in center
                            x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                            x = x - (labelWidth * 0.5) as int;
                            y = (bounds.getMinY() + (bounds.getHeight() * 0.5) as int) as int;
                            y = y - descent;

                            ti.setLocation(Math.round(x), Math.round(y));
                            arrMods.push(ti);
                        }
                        else {
                            if (ec === 110202)//tropopause High
                            {
                                strText = "X?";
                                if (modX != null) {

                                    strText = modX;
                                }


                                ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                                labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;
                                //One modifier symbols and modifier goes in center
                                x = (bounds.getMinX() + (bounds.getWidth() * 0.5) as int) as int;
                                x = x - (labelWidth * 0.5) as int;
                                y = (bounds.getMinY() + (bounds.getHeight() * 0.5) as int) as int;
                                //y = y + (int) ((labelHeight * 0.5f) + (labelHeight/2));
                                y = y + (((labelHeight * 0.5) - (labelHeight / 2)) + labelHeight - descent) as int;

                                ti.setLocation(Math.round(x), Math.round(y));
                                arrMods.push(ti);
                            }
                        }

                    }

                }

            }
        }

        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="DOM Arrow">
        let domPoints: Point2D[];
        let domBounds: Rectangle2D;

        if (modifiers != null && modifiers.has(Modifiers.Q_DIRECTION_OF_MOVEMENT) &&
            SymbolUtilities.isCBRNEvent(symbolID))//CBRN events
        {
            strText = modifiers.get(Modifiers.Q_DIRECTION_OF_MOVEMENT);
            if (strText != null && SymbolUtilities.isNumber(strText)) {
                let q: float = parseFloat(strText);
                let tempBounds: Rectangle2D = RectUtilities.copyRect(bounds);

                tempBounds = tempBounds.createUnion(new Rectangle2D(bounds.getCenterX(), yForY, 0, 0));

                //boolean isY = modifiers.has(Modifiers.Y_LOCATION);

                domPoints = ModifierRenderer.createDOMArrowPoints(symbolID, tempBounds, sdi.getSymbolCenterPoint(), q, false, frc);

                domBounds = new Rectangle2D(domPoints[0].getX(), domPoints[0].getY(), 1, 1);

                let temp: Point2D;
                for (let i: int = 1; i < 6; i++) {
                    temp = domPoints[i];
                    if (temp != null) {
                        domBounds = domBounds.createUnion(new Rectangle2D(temp.getX(), temp.getY(), 0, 0));
                    }
                }
                imageBounds = imageBounds.createUnion(domBounds);
            }
        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Build Feint Dummy Indicator">

        if (SymbolUtilities.hasFDI(symbolID)) {
            //create feint indicator /\
            fdiLeft = new Point2D(bounds.getX(), bounds.getY());
            fdiRight = new Point2D((bounds.getX() + bounds.getWidth()), bounds.getY());
            fdiTop = new Point2D(Math.round(bounds.getCenterX()), Math.round(bounds.getY() - (bounds.getWidth() * .5)));


            fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());

            ti = new TextInfo("TEST", 0, 0, ModifierRenderer._modifierFont, frc);
            if (ti != null && SymbolUtilities.isCBRNEvent(symbolID)) {
                let shiftY: int = Math.round(bounds.getY() - ti.getTextBounds().getHeight() - 2) as int;
                fdiLeft.setLocation(fdiLeft.getX(), fdiLeft.getY() + shiftY);
                //fdiLeft.offset(0, shiftY);
                fdiTop.setLocation(fdiTop.getX(), fdiTop.getY() + shiftY);
                //fdiTop.offset(0, shiftY);
                fdiRight.setLocation(fdiRight.getX(), fdiRight.getY() + shiftY);
                //fdiRight.offset(0, shiftY);
                fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());
                //fdiBounds.offset(0, shiftY);
            }

            imageBounds = imageBounds.createUnion(fdiBounds);

        }
        // </editor-fold>

        // <editor-fold defaultstate="collapsed" desc="Shift Points and Draw">
        let modifierBounds: Rectangle2D;
        if (arrMods != null && arrMods.length > 0) {

            //build modifier bounds/////////////////////////////////////////
            modifierBounds = arrMods[0].getTextOutlineBounds();
            let size: int = arrMods.length;
            let tempShape: TextInfo;
            for (let i: int = 1; i < size; i++) {
                tempShape = arrMods[i];
                modifierBounds = modifierBounds.createUnion(tempShape.getTextOutlineBounds());
            }

        }

        if (modifierBounds != null || domBounds != null || fdiBounds != null) {

            if (modifierBounds != null) {
                imageBounds = imageBounds.createUnion(modifierBounds);
            }
            if (domBounds != null) {
                imageBounds = imageBounds.createUnion(domBounds);
            }
            if (fdiBounds != null) {
                imageBounds = imageBounds.createUnion(fdiBounds);
            }

            //shift points if needed////////////////////////////////////////
            if (sdi instanceof ImageInfo && (imageBounds.getMinX() < 0 || imageBounds.getMinY() < 0)) {
                let shiftX: int = Math.abs(imageBounds.getMinX() as int);
                let shiftY: int = Math.abs(imageBounds.getMinY() as int);

                //shift mobility points
                let size: int = arrMods.length;
                let tempShape: TextInfo;
                for (let i: int = 0; i < size; i++) {
                    tempShape = arrMods[i];
                    tempShape.shift(shiftX, shiftY);
                }
                if (modifierBounds != null) {

                    RectUtilities.shift(modifierBounds, shiftX, shiftY);
                }


                if (domBounds != null) {
                    for (let i: int = 0; i < 6; i++) {
                        let temp: Point2D = domPoints[i];
                        if (temp != null) {
                            temp.setLocation(temp.getX() + shiftX, temp.getY() + shiftY);
                        }
                    }
                    RectUtilities.shift(domBounds, shiftX, shiftY);
                }

                //If there's an FDI
                if (fdiBounds != null) {
                    ShapeUtilities.offset(fdiBounds, shiftX, shiftY);
                    ShapeUtilities.offset(fdiLeft, shiftX, shiftY);
                    ShapeUtilities.offset(fdiTop, shiftX, shiftY);
                    ShapeUtilities.offset(fdiRight, shiftX, shiftY);
                }

                //shift image points
                centerPoint.setLocation(centerPoint.getX() + shiftX, centerPoint.getX() + shiftY);
                RectUtilities.shift(symbolBounds, shiftX, shiftY);
                RectUtilities.shift(imageBounds, shiftX, shiftY);
            }

            if (attributes.has(MilStdAttributes.TextColor)) {
                textColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextColor));
            }
            if (attributes.has(MilStdAttributes.TextBackgroundColor)) {
                textBackgroundColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextBackgroundColor));
            }
            textColor = RendererUtilities.setColorAlpha(textColor, alpha);
            textBackgroundColor = RendererUtilities.setColorAlpha(textBackgroundColor, alpha);

            if (sdi instanceof SVGSymbolInfo) {
                let svgStroke: string = RendererUtilities.colorToHexString(lineColor, false);
                let svgStrokeWidth: number = strokeWidth;//"3";
                let svgAlpha: string;
                if (alpha > -1) {

                    svgAlpha = alpha.toString();
                }

                ssi = sdi as SVGSymbolInfo;
                let sbSVG:string =  "";
                sbSVG += (ssi.getSVG());
                sbSVG += (ModifierRenderer.renderTextElements(arrMods, textColor, textBackgroundColor));

                // <editor-fold defaultstate="collapsed" desc="DOM arrow">
                if (domBounds != null) {
                    let domPath: Path = new Path();

                    domPath.moveTo(domPoints[0].getX(), domPoints[0].getY());
                    if (domPoints[1] != null) {
                        domPath.lineTo(domPoints[1].getX(), domPoints[1].getY());
                    }
                    if (domPoints[2] != null) {
                        domPath.lineTo(domPoints[2].getX(), domPoints[2].getY());
                    }
                    sbSVG += (domPath.toSVGElement(svgStroke, svgStrokeWidth, null));

                    domPath = new Path();

                    domPath.moveTo(domPoints[3].getX(), domPoints[3].getY());
                    domPath.lineTo(domPoints[4].getX(), domPoints[4].getY());
                    domPath.lineTo(domPoints[5].getX(), domPoints[5].getY());
                    sbSVG += (domPath.toSVGElement(null, 0, svgStroke));

                    domBounds = null;
                    domPoints = null;
                }
                // </editor-fold>

                //<editor-fold defaultstate="collapsed" desc="Draw FDI">
                if (fdiBounds != null) {
                    let svgFDIDashArray: string = "6 4";
                    let dashArray: number[] = [6, 4];

                    if (symbolBounds.getHeight() < 20) {
                        svgFDIDashArray = "5 3";
                    }

                    let fdiPath: Path = new Path();
                    fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                    fdiPath.lineTo(fdiLeft.getX(), fdiLeft.getY());
                    fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                    fdiPath.lineTo(fdiRight.getX(), fdiRight.getY());//*/

                    sbSVG += (fdiPath.toSVGElement(svgStroke, svgStrokeWidth, null));
                }
                //</editor-fold>

                newsdi = new SVGSymbolInfo(sbSVG.toString().valueOf(), centerPoint, symbolBounds, imageBounds);

            }


            // <editor-fold defaultstate="collapsed" desc="Cleanup">

            // </editor-fold>

            return newsdi;

        }
        else 
        {
            return null;
        }
        // </editor-fold>

    }

    /**
     * Process modifiers for action points
     */
    public static ProcessTGSPModifiers(sdi: SymbolDimensionInfo, symbolID: string, modifiers: Map<string, string>, attributes: Map<string, string>, lineColor: Color, frc: OffscreenCanvasRenderingContext2D): SymbolDimensionInfo {

        // <editor-fold defaultstate="collapsed" desc="Variables">
        let ii: ImageInfo;
        let ssi: SVGSymbolInfo;

        let bufferXL: int = 6;
        let bufferXR: int = 4;
        let bufferY: int = 2;
        let bufferText: int = 2;
        let centerOffset: int = 1; //getCenterX/Y function seems to go over by a pixel
        let x: int = 0;
        let y: int = 0;
        let x2: int = 0;
        let y2: int = 0;

        //Feint Dummy Indicator variables
        let fdiBounds: Rectangle2D;
        let fdiTop: Point2D;
        let fdiLeft: Point2D;
        let fdiRight: Point2D;

        let outlineOffset: int = ModifierRenderer.RS.getTextOutlineWidth();
        let labelHeight: int = 0;
        let labelWidth: int = 0;
        let alpha: float = -1;
        let newsdi: SymbolDimensionInfo;

        let textColor: Color = lineColor;
        let textBackgroundColor: Color;

        let arrMods: Array<TextInfo> = new Array<TextInfo>();
        let duplicate: boolean = false;

        let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);


        if (attributes.has(MilStdAttributes.Alpha)) {
            alpha = parseFloat(attributes.get(MilStdAttributes.Alpha)) / 255;
        }

        let bounds: Rectangle2D = RectUtilities.copyRect(sdi.getSymbolBounds());
        let symbolBounds: Rectangle2D = RectUtilities.copyRect((sdi.getSymbolBounds()));
        let centerPoint: Point2D = sdi.getSymbolCenterPoint();
        let imageBounds: Rectangle2D = RectUtilities.copyRect((sdi.getImageBounds()));

        //centerPoint = new Point2D(Math.round(sdi.getSymbolCenterPoint().x), Math.round(sdi.getSymbolCenterPoint().y));
        centerPoint = new Point2D(sdi.getSymbolCenterPoint().x, sdi.getSymbolCenterPoint().y);

        let byLabelHeight: boolean = false;

        labelHeight = Math.round(ModifierRenderer._modifierFontHeight + 0.5);
        let maxHeight: int = (symbolBounds.getHeight()) as int;
        if ((labelHeight * 3) > maxHeight) {
            byLabelHeight = true;
        }

        let descent: int = (ModifierRenderer._modifierFontDescent) as int;
        let yForY: int = -1;

        let labelBounds1: Rectangle2D;//text.getPixelBounds(null, 0, 0);
        let labelBounds2: Rectangle2D;
        let strText: string = "";
        let strText1: string = "";
        let strText2: string = "";
        let text1: TextInfo;
        let text2: TextInfo;

        let basicID: string = SymbolUtilities.getBasicSymbolID(symbolID);

        if (outlineOffset > 2) {
            outlineOffset = ((outlineOffset - 1) / 2);
        }
        else {
            outlineOffset = 0;
        }

        /*bufferXL += outlineOffset;
         bufferXR += outlineOffset;
         bufferY += outlineOffset;
         bufferText += outlineOffset;*/
        // </editor-fold>
        // <editor-fold defaultstate="collapsed" desc="Process Modifiers">
        let ti: TextInfo;

        if(modifiers != null && modifiers.size > 0)
        {
            if (msi.getModifiers().includes(Modifiers.N_HOSTILE) && modifiers.has(Modifiers.N_HOSTILE)) {
                strText = modifiers.get(Modifiers.N_HOSTILE);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                    x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;

                    if (!byLabelHeight) {
                        y = ((bounds.getHeight() / 3) * 2) as int;//checkpoint, get box above the point
                        y = bounds.getMinY() as int + y;
                    }
                    else {
                        //y = ((labelHeight + bufferText) * 3);
                        //y = bounds.y + y - descent;
                        y = (bounds.getMinY() + bounds.getHeight()) as int;
                    }

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }

            }
            if (msi.getModifiers().includes(Modifiers.H_ADDITIONAL_INFO_1) && modifiers.has(Modifiers.H_ADDITIONAL_INFO_1)) {
                strText = modifiers.get(Modifiers.H_ADDITIONAL_INFO_1);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                    x = x - (labelWidth * 0.5) as int;
                    y = bounds.getMinY() as int - descent;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.H1_ADDITIONAL_INFO_2) && modifiers.has(Modifiers.H1_ADDITIONAL_INFO_2)) {
                strText = modifiers.get(Modifiers.H1_ADDITIONAL_INFO_2);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                    x = x - (labelWidth * 0.5) as int;
                    y = (bounds.getMinY() + labelHeight - descent + (bounds.getHeight() * 0.07)) as int;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.A_SYMBOL_ICON)) {
                if (modifiers.has(Modifiers.A_SYMBOL_ICON)) {

                    strText = modifiers.get(Modifiers.A_SYMBOL_ICON);
                }

                else {
                    if (SymbolID.getEntityCode(symbolID) === 321706) {
                        //NATO Multiple Supply Class Point
                        strText = "ALL?";
                    }

                }
                //make it clear the required 'A' value wasn't set for this symbol.

                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                    x = x - (labelWidth * 0.5) as int;
                    y = (bounds.getMinY() + labelHeight - descent + (bounds.getHeight() * 0.07)) as int;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.W_DTG_1) && modifiers.has(Modifiers.W_DTG_1)) {
                strText = modifiers.get(Modifiers.W_DTG_1);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    x = (bounds.getMinX() - labelWidth - bufferXL) as int;
                    y = (bounds.getMinY() + labelHeight - descent) as int;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.W1_DTG_2) && modifiers.has(Modifiers.W1_DTG_2)) {
                strText = modifiers.get(Modifiers.W1_DTG_2);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    x = bounds.getMinX() as int - labelWidth - bufferXL;

                    y = ((labelHeight - descent + bufferText) * 2);
                    y = bounds.getMinY() as int + y;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.T_UNIQUE_DESIGNATION_1) && modifiers.has(Modifiers.T_UNIQUE_DESIGNATION_1)) {
                strText = modifiers.get(Modifiers.T_UNIQUE_DESIGNATION_1);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);

                    x = (bounds.getMinX() + bounds.getWidth() + bufferXR) as int;
                    y = bounds.getMinY() as int + labelHeight - descent;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }
            if (msi.getModifiers().includes(Modifiers.T1_UNIQUE_DESIGNATION_2) && modifiers.has(Modifiers.T1_UNIQUE_DESIGNATION_2)) {
                strText = modifiers.get(Modifiers.T1_UNIQUE_DESIGNATION_2);
                if (strText != null) {
                    ti = new TextInfo(strText, 0, 0, ModifierRenderer._modifierFont, frc);
                    labelWidth = Math.round(ti.getTextBounds().getWidth()) as int;

                    //points
                    x = (bounds.getMinX() + (bounds.getWidth() * 0.5)) as int;
                    x = x - (labelWidth * 0.5) as int;
                    //y = bounds.y + (bounds.getHeight * 0.5);

                    y = ((bounds.getHeight() * 0.55)) as int;//633333333
                    y = bounds.getMinY() as int + y;

                    ti.setLocation(x, y);
                    arrMods.push(ti);
                }
            }

        }
        // <editor-fold defaultstate="collapsed" desc="Build Feint Dummy Indicator">

        if (SymbolUtilities.hasFDI(symbolID)) {
            //create feint indicator /\
            fdiLeft = new Point2D(bounds.getX(), bounds.getY());
            fdiRight = new Point2D((bounds.getX() + bounds.getWidth()), bounds.getY());
            fdiTop = new Point2D(Math.round(bounds.getCenterX()), Math.round(bounds.getY() - (bounds.getWidth() * .5)));


            fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());

            ti = new TextInfo("TEST", 0, 0, ModifierRenderer._modifierFont, frc);
            if (ti != null) {
                let shiftY: int = Math.round(bounds.getY() - ti.getTextBounds().getHeight() - 2) as int;
                fdiLeft.setLocation(fdiLeft.getX(), fdiLeft.getY() + shiftY);
                //fdiLeft.offset(0, shiftY);
                fdiTop.setLocation(fdiTop.getX(), fdiTop.getY() + shiftY);
                //fdiTop.offset(0, shiftY);
                fdiRight.setLocation(fdiRight.getX(), fdiRight.getY() + shiftY);
                //fdiRight.offset(0, shiftY);
                fdiBounds = new Rectangle2D(fdiLeft.getX(), fdiTop.getY(), fdiRight.getX() - fdiLeft.getX(), fdiLeft.getY() - fdiTop.getY());
                //fdiBounds.offset(0, shiftY);
            }

            imageBounds = imageBounds.createUnion(fdiBounds);
        // </editor-fold>

        }

        // </editor-fold>
        // <editor-fold defaultstate="collapsed" desc="Shift Points and Draw">
        let modifierBounds: Rectangle2D;
        if (arrMods != null && arrMods.length > 0) {

            //build modifier bounds/////////////////////////////////////////
            modifierBounds = arrMods[0].getTextOutlineBounds();
            let size: int = arrMods.length;
            let tempShape: TextInfo;
            for (let i: int = 1; i < size; i++) {
                tempShape = arrMods[i];
                modifierBounds = modifierBounds.createUnion(tempShape.getTextOutlineBounds());
            }

        }

        if (fdiBounds != null) {
            if (modifierBounds != null) {

                modifierBounds = modifierBounds.createUnion(fdiBounds);
            }

            else {

                modifierBounds = fdiBounds;
            }

        }


        if (modifierBounds != null) {

            imageBounds = imageBounds.createUnion(modifierBounds);

            //shift points if needed////////////////////////////////////////
            if (sdi instanceof ImageInfo && (imageBounds.getMinX() < 0 || imageBounds.getMinY() < 0)) {
                let shiftX: int = Math.abs(imageBounds.getMinX()) as int;
                let shiftY: int = Math.abs(imageBounds.getMinY()) as int;

                //shift mobility points
                let size: int = arrMods.length;
                let tempShape: TextInfo;
                for (let i: int = 0; i < size; i++) {
                    tempShape = arrMods[i];
                    tempShape.shift(shiftX, shiftY);
                }
                RectUtilities.shift(modifierBounds, shiftX, shiftY);

                //shift image points
                centerPoint.setLocation(centerPoint.getX() + shiftX, centerPoint.getY() + shiftY);
                RectUtilities.shift(symbolBounds, shiftX, shiftY);
                RectUtilities.shift(imageBounds, shiftX, shiftY);

                //If there's an FDI
                if (fdiBounds != null) {
                    ShapeUtilities.offset(fdiBounds, shiftX, shiftY);
                    ShapeUtilities.offset(fdiLeft, shiftX, shiftY);
                    ShapeUtilities.offset(fdiTop, shiftX, shiftY);
                    ShapeUtilities.offset(fdiRight, shiftX, shiftY);
                }
            }

            if (attributes.has(MilStdAttributes.TextColor)) {
                textColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextColor));
            }
            if (attributes.has(MilStdAttributes.TextBackgroundColor)) {
                textBackgroundColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextBackgroundColor));
            }
            textColor = RendererUtilities.setColorAlpha(textColor, alpha);
            textBackgroundColor = RendererUtilities.setColorAlpha(textBackgroundColor, alpha);

            if (sdi instanceof SVGSymbolInfo) {
                let svgStroke: string = RendererUtilities.colorToHexString(lineColor, false);
                let svgStrokeWidth: number = 3;
                let svgAlpha: string;
                if (alpha > -1) {

                    svgAlpha = alpha.toString();
                }

                ssi = sdi as SVGSymbolInfo;
                let sbSVG:string = "";
                sbSVG += (ssi.getSVG());
                sbSVG += (ModifierRenderer.renderTextElements(arrMods, textColor, textBackgroundColor));

                //<editor-fold defaultstate="collapsed" desc="Draw FDI">
                if (fdiBounds != null) {
                    let svgFDIDashArray: string = "6 4";
                    let dashArray: number[] = [6, 4];

                    if (symbolBounds.getHeight() < 20) {
                        svgFDIDashArray = "5 3";
                    }

                    let fdiPath: Path = new Path();
                    fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                    fdiPath.lineTo(fdiLeft.getX(), fdiLeft.getY());
                    fdiPath.moveTo(fdiTop.getX(), fdiTop.getY());
                    fdiPath.lineTo(fdiRight.getX(), fdiRight.getY());//*/

                    fdiPath.setLineDash(svgFDIDashArray);
                    sbSVG += (fdiPath.toSVGElement(svgStroke, svgStrokeWidth, null));
                }
                //</editor-fold>

                newsdi = new SVGSymbolInfo(sbSVG.toString().valueOf(), centerPoint, symbolBounds, imageBounds);
            }

            // <editor-fold defaultstate="collapsed" desc="Cleanup">

            // </editor-fold>
        }
        // </editor-fold>
        return newsdi;

    }

    private static shiftUnitPointsAndDraw(tiArray: Array<TextInfo>, sdi:SymbolDimensionInfo, attributes: Map<string, string>)
    {
        let ii:ImageInfo = null;
        let ssi:SVGSymbolInfo = null;
        let newsdi:SymbolDimensionInfo = null;

        let alpha:number = -1;

        if (attributes != null && attributes.has(MilStdAttributes.Alpha))
        {
            alpha = Number.parseInt(attributes.get(MilStdAttributes.Alpha));
        }

        let textColor:Color = Color.BLACK;
        let textBackgroundColor:Color = null;

        let symbolBounds:Rectangle2D = sdi.getSymbolBounds();
        let centerPoint:Point2D = sdi.getSymbolCenterPoint();
        let imageBounds:Rectangle2D = sdi.getImageBounds();
        let imageBoundsOld:Rectangle2D = sdi.getImageBounds();

        let modifierBounds: Rectangle2D;
        if (tiArray != null && tiArray.length > 0) {

            //build modifier bounds/////////////////////////////////////////
            modifierBounds = tiArray[0].getTextOutlineBounds();
            let size: int = tiArray.length;
            let tempShape: TextInfo;
            for (let i: int = 1; i < size; i++) {
                tempShape = tiArray[i];
                modifierBounds.union(tempShape.getTextOutlineBounds());
            }

        }

        if (modifierBounds != null) {

            imageBounds.union(modifierBounds);

            //shift points if needed////////////////////////////////////////
            if (sdi instanceof ImageInfo && (imageBounds.getX() < 0 || imageBounds.getY() < 0)) {
                let shiftX: int = Math.round(Math.abs(imageBounds.getX())) as int;
                let
                    shiftY: int = Math.round(Math.abs(imageBounds.getY())) as int;

                //shift mobility points
                let size: int = tiArray.length;
                let tempShape: TextInfo;
                for (let i: int = 0; i < size; i++) {
                    tempShape = tiArray[i];
                    tempShape.shift(shiftX, shiftY);
                }
                RectUtilities.shift(modifierBounds, shiftX, shiftY);
                //modifierBounds.shift(shiftX,shiftY);

                //shift image points
                centerPoint.setLocation(centerPoint.getX() + shiftX, centerPoint.getY() + shiftY);
                RectUtilities.shift(symbolBounds, shiftX, shiftY);
                RectUtilities.shift(imageBounds, shiftX, shiftY);
                RectUtilities.shift(imageBoundsOld, shiftX, shiftY);
                /*centerPoint.shift(shiftX, shiftY);
                 symbolBounds.shift(shiftX, shiftY);
                 imageBounds.shift(shiftX, shiftY);
                 imageBoundsOld.shift(shiftX, shiftY);//*/
            }

            if (attributes.has(MilStdAttributes.TextColor)) {
                textColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextColor));
            }
            if (attributes.has(MilStdAttributes.TextBackgroundColor)) {
                textBackgroundColor = RendererUtilities.getColorFromHexString(attributes.get(MilStdAttributes.TextBackgroundColor));
            }
            textColor = RendererUtilities.setColorAlpha(textColor, alpha);
            textBackgroundColor = RendererUtilities.setColorAlpha(textBackgroundColor, alpha);

            if (sdi instanceof SVGSymbolInfo) {
                ssi = sdi as SVGSymbolInfo;
                let sb:string = "";
                sb += (ModifierRenderer.renderTextElements(tiArray, textColor, textBackgroundColor));
                sb += (ssi.getSVG());
                newsdi = new SVGSymbolInfo(sb.toString().valueOf(), centerPoint, symbolBounds, imageBounds);
            }
        }

        return newsdi;
    }

    private static renderTextElement(tiArray: Array<TextInfo>, color: Color, backgroundColor: Color): string {
        let sbSVG:string = "";

        let svgStroke: string = RendererUtilities.colorToHexString(RendererUtilities.getIdealOutlineColor(color), false);
        if (backgroundColor != null) {

            svgStroke = RendererUtilities.colorToHexString(backgroundColor, false);
        }


        let svgFill: string = RendererUtilities.colorToHexString(color, false);
        let svgStrokeWidth: string = "2";//String.valueOf(RendererSettings.getInstance().getTextOutlineWidth());
        for (let ti of tiArray) {
            sbSVG += (Shape2SVG.Convert(ti, svgStroke, svgFill, svgStrokeWidth, null, null, null));
            sbSVG += ("\n");
        }

        return sbSVG.toString().valueOf();
    }

    private static renderTextElements(tiArray: Array<TextInfo>, color: Color, backgroundColor: Color | null): string {
        let style: string;
        let name: string = RendererSettings.getInstance().getLabelFont().getName() + ", sans-serif";//"SansSerif";
        let size: string = RendererSettings.getInstance().getLabelFont().getSize().toString();
        let weight: string;
        let anchor: string;//"start";
        if (RendererSettings.getInstance().getLabelFont().isBold()) {

            weight = "bold";
        }

        let sbSVG:string = "";

        let svgStroke: string = RendererUtilities.colorToHexString(RendererUtilities.getIdealOutlineColor(color), false);
        if (backgroundColor != null) {

            svgStroke = RendererUtilities.colorToHexString(backgroundColor, false);
        }


        let svgFill: string = RendererUtilities.colorToHexString(color, false);
        let svgStrokeWidth: string = "2";//String.valueOf(RendererSettings.getInstance().getTextOutlineWidth());
        sbSVG += ("\n<g");
        sbSVG += (" font-family=\"" + name + '"');
        sbSVG += (" font-size=\"" + size + "px\"");
        if (weight != null) {

            sbSVG += (" font-weight=\"" + weight + "\"");
        }

        sbSVG += (" alignment-baseline=\"alphabetic\"");//
        sbSVG += (">");

        for (let ti of tiArray) {
            sbSVG += (Shape2SVG.ConvertForGroup(ti, svgStroke, svgFill, svgStrokeWidth, null, null, null));
            sbSVG += ("\n");
        }
        sbSVG += ("</g>\n");

        return sbSVG.toString().valueOf();

    }

    /**
     *
     * @param g2d
     * @param tiArray
     * @param color
     * @param backgroundColor
     */
    public static renderText(g2d: OffscreenCanvasRenderingContext2D, tiArray: TextInfo[], textColor: Color, textBackgroundColor: Color): void {
        let color: Color;

        /*for (TextInfo textInfo : tiArray)
         {
         ctx.drawText(textInfo.getText(), textInfo.getLocation().x, textInfo.getLocation().y, _modifierFont);
         }*/

        let size: int = tiArray.length;

        let tbm: int = RendererSettings.getInstance().getTextBackgroundMethod();
        let outlineWidth: int = RendererSettings.getInstance().getTextOutlineWidth();

        if (outlineWidth > 2) {

            outlineWidth = 2;
        }



        if (textColor == null) {
            color = Color.BLACK;
        }

        let outlineColor: Color;

        if (textBackgroundColor != null) {

            outlineColor = textBackgroundColor;
        }

        else {

            outlineColor = RendererUtilities.getIdealOutlineColor(color);
        }


        if (color.getAlpha() !== 255 && outlineColor.getAlpha() === 255) {

            outlineColor = RendererUtilities.setColorAlpha(outlineColor, color.getAlpha() / 255);
        }

        g2d.font = RendererSettings.getInstance().getLabelFont.toString();
        //g2d.setFont(RendererSettings.getInstance().getLabelFont());
        //g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        //g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g2d.lineWidth = outlineWidth;
        g2d.fillStyle = color.toHexString();
        g2d.strokeStyle = textBackgroundColor.toHexString();

        if (tbm === RendererSettings.TextBackgroundMethod_OUTLINE_QUICK) {
            let tempShape: TextInfo;
            //draw text outline
            //_modifierFont.setStyle(Style.FILL);
            //            _modifierFont.setStrokeWidth(RS.getTextOutlineWidth());
            //            _modifierFont.setColor(outlineColor.toInt());
            if (outlineWidth > 0) {
                for (var i = 0; i < size; i++) {
                    tempShape = tiArray.at(i);
                    tempShape.strokeText(g2d);
                }
            }
            //draw text
            g2d.fillStyle = color.toHexString(false);

            for (let j: int = 0; j < size; j++) {
                let textInfo: TextInfo = tiArray.at(j);
                textInfo.fillText(g2d);
            }
        }
        else if (tbm === RendererSettings.TextBackgroundMethod_OUTLINE) {
            //TODO: compare performance against TextBackgroundMethod_OUTLINE_QUICK
            let tempShape: TextInfo;
            if (outlineWidth > 0)
                g2d.lineWidth = (outlineWidth * 2) + 1;

            for (var i = 0; i < size; i++) {
                tempShape = tiArray[i];
                if (outlineWidth > 0) {
                    tempShape.strokeText(g2d);
                }
                tempShape.fillText(g2d);
            }
        }
        else if (tbm === RendererSettings.TextBackgroundMethod_COLORFILL) {
            g2d.fillStyle = outlineColor.toHexString();

            //draw rectangle
            for (let k: int = 0; k < size; k++) {
                let textInfo: TextInfo = tiArray[k];
                textInfo.getTextOutlineBounds().fill(g2d);
            }
            //draw text
            g2d.fillStyle = color.toHexString();

            for (let j: int = 0; j < size; j++) {
                let textInfo: TextInfo = tiArray[j];
                textInfo.fillText(g2d);
            }
        }
        else if (tbm === RendererSettings.TextBackgroundMethod_NONE) {
            for (let j: int = 0; j < size; j++) {
                let textInfo: TextInfo = tiArray[j];
                textInfo.fillText(g2d);
            }
        }


    }



    public static hasDisplayModifiers(symbolID: string, modifiers: Map<string, string>): boolean {
        let hasModifiers: boolean = false;
        let ss: int = SymbolID.getSymbolSet(symbolID);
        let status: int = SymbolID.getStatus(symbolID);
        let context: int = SymbolID.getContext(symbolID);

        if (ss === SymbolID.SymbolSet_ControlMeasure)//check control measure
        {
            if (SymbolUtilities.isCBRNEvent(symbolID) === true && modifiers != null && modifiers.has(Modifiers.Q_DIRECTION_OF_MOVEMENT)) {
                hasModifiers = true;
            }
            else {
                if (SymbolUtilities.hasFDI(symbolID)) {

                    hasModifiers = true;
                }

            }

        }
        else if (ss !== SymbolID.SymbolSet_Atmospheric &&
            ss !== SymbolID.SymbolSet_Oceanographic &&
            ss !== SymbolID.SymbolSet_MeteorologicalSpace) //checking units
        {
            if (context > 0) {
                //Exercise or Simulation
                hasModifiers = true;
            }


            //echelon or mobility,
            if (SymbolID.getAmplifierDescriptor(symbolID) > 0) 
            {
                hasModifiers = true;
            }


            if(modifiers != null)
            {
                if (modifiers.has(Modifiers.AO_ENGAGEMENT_BAR) || modifiers.has(Modifiers.Q_DIRECTION_OF_MOVEMENT)) 
                {
                    hasModifiers = true;
                }
            }


            //HQ/Taskforce
            if (SymbolID.getHQTFD(symbolID) > 0) {

                hasModifiers = true;
            }


            if (status > 1) {
                //Fully capable, damaged, destroyed
                hasModifiers = true;
            }


        }
        //no display modifiers for single point weather



        return hasModifiers;
    }

    public static hasTextModifiers(symbolID: string, modifiers: Map<string, string>): boolean {

        let ss: int = SymbolID.getSymbolSet(symbolID);
        let ec: int = SymbolID.getEntityCode(symbolID);
        if (ss === SymbolID.SymbolSet_Atmospheric) {
            switch (ec) {
                case 110102: //tropopause low
                case 110202: //tropopause high
                case 162200: //tropopause level ?
                case 162300: { //freezing level ?
                    return true;
                }

                default: {
                    return false;
                }

            }
        }
        else if (ss === SymbolID.SymbolSet_Oceanographic || ss === SymbolID.SymbolSet_MeteorologicalSpace) {
            return false;
        }
        else if (ss === SymbolID.SymbolSet_ControlMeasure) 
        {
            let msi: MSInfo = MSLookup.getInstance().getMSLInfo(symbolID);
            
            if (msi.getModifiers().length > 0 && modifiers != null && modifiers.size > 0) {

                return true;
            }

            else {

                return false;
            }

        }
        else if (SymbolUtilities.getStandardIdentityModifier(symbolID) != null) 
        {
            return true;
        }

        let cc: int = SymbolID.getCountryCode(symbolID);
        if (cc > 0 && GENCLookup.getInstance().get3CharCode(cc) !== "") {
            return true;
        }//*/

        else {
            if (modifiers != null && modifiers.size > 0) {
                return true;
            }
        }

        return false;
    }

}
