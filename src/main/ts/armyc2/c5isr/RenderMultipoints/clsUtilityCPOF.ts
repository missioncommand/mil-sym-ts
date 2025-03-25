import { GeneralPath } from "../graphics2d/GeneralPath"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { arraysupport } from "../JavaLineArray/arraysupport"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { clsUtility as clsUtilityJTR } from "../JavaTacticalRenderer/clsUtility"
import { mdlGeodesic } from "../JavaTacticalRenderer/mdlGeodesic"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { IPointConversion } from "../renderer/utilities/IPointConversion"
import { RendererException } from "../renderer/utilities/RendererException"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { SymbolUtilities } from "../renderer/utilities/SymbolUtilities"
import { clsClipPolygon2 } from "../RenderMultipoints/clsClipPolygon2"
import { clsClipQuad } from "../RenderMultipoints/clsClipQuad"
import { clsUtility } from "../RenderMultipoints/clsUtility"
import { clsMETOC } from "../JavaTacticalRenderer/clsMETOC";

import { type int, type double } from "../../c5isr/graphics2d/BasicTypes";

/**
 * CPOF utility functions taken from JavaLineArrayCPOF
 *
 *
 */
export class clsUtilityCPOF {

    private static readonly _className: string = "clsUtilityCPOF";

    /**
     *
     * @param ptLatLong
     * @param converter
     * @return
     */
    private static PointLatLongToPixels(ptLatLong: POINT2,
        converter: IPointConversion): POINT2 {
        let pt: POINT2 = new POINT2();
        try {
            let x: double = ptLatLong.x;
            let y: double = ptLatLong.y;
            let ptPixels: Point2D = converter.GeoToPixels(new Point2D(x, y));
            pt.x = ptPixels.getX();
            pt.y = ptPixels.getY();
            pt.style = ptLatLong.style;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "PointLatLongToPixels",
                    new RendererException("Failed inside PointLatLongToPixels", exc));
            } else {
                throw exc;
            }
        }
        return pt;
    }

    /**
     * for the change 1 fire support areas
     *
     * @param tg
     * @param lineType
     * @param radius
     * @param width
     * @param length
     * @param attitude
     */
    private static GetNumericFields(tg: TGLight,
        lineType: int,
        radius: ref<number[]>,
        width: ref<number[]>,
        length: ref<number[]>,
        attitude: ref<number[]>): void {
        try {
            if (lineType === TacticalLines.RANGE_FAN_FILL) {
                return;
            }
            let dist: double = 0;
            let a12: ref<number[]> = new ref();
            let a21: ref<number[]> = new ref();
            let pt0: POINT2 = new POINT2(0, 0);
            let pt1: POINT2 = new POINT2(0, 0);
            radius.value = new Array<number>(1);
            width.value = new Array<number>(1);
            attitude.value = new Array<number>(1);
            length.value = new Array<number>(1);
            switch (lineType) {
                case TacticalLines.CIRCULAR:
                case TacticalLines.BDZ:
                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.NOTACK:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR: {
                    if (SymbolUtilities.isNumber(tg.get_AM())) {
                        radius.value[0] = parseFloat(tg.get_AM());
                    }
                    break;
                }

                case TacticalLines.LAUNCH_AREA:
                case TacticalLines.DEFENDED_AREA_CIRCULAR:
                case TacticalLines.SHIP_AOI_CIRCULAR: {
                    //minor radius in meters
                    if (SymbolUtilities.isNumber(tg.get_AM1())) {
                        length.value[0] = parseFloat(tg.get_AM1());
                    }
                    //major radius in meters
                    if (SymbolUtilities.isNumber(tg.get_AM())) {
                        width.value[0] = parseFloat(tg.get_AM());
                    }
                    //rotation angle in degrees
                    if (SymbolUtilities.isNumber(tg.get_AN())) {
                        attitude.value[0] = parseFloat(tg.get_AN());
                    }

                    break;
                }

                case TacticalLines.RECTANGULAR: {
                    if (SymbolUtilities.isNumber(tg.get_AM1())) {
                        length.value[0] = parseFloat(tg.get_AM1());
                    }
                    if (SymbolUtilities.isNumber(tg.get_AM())) {
                        width.value[0] = parseFloat(tg.get_AM());
                    }
                    //assume that attitude was passed in mils
                    //so we must multiply by 360/6400 to convert to degrees
                    if (SymbolUtilities.isNumber(tg.get_AN())) {
                        attitude.value[0] = parseFloat(tg.get_AN()) * (360 / 6400);
                    }
                    break;
                }

                case TacticalLines.CUED_ACQUISITION: {
                    if (SymbolUtilities.isNumber(tg.get_AM())) {
                        length.value[0] = parseFloat(tg.get_AM());
                    }
                    if (SymbolUtilities.isNumber(tg.get_AM1())) {
                        width.value[0] = parseFloat(tg.get_AM1());
                    }
                    if (SymbolUtilities.isNumber(tg.get_AN())) {
                        // Make 0 degrees point north instead of East
                        attitude.value[0] = parseFloat(tg.get_AN()) + 270;
                    }
                    break;
                }

                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET: {
                    if (tg.LatLongs.length >= 2) {
                        //get the length and the attitude in mils
                        pt0 = tg.LatLongs[0];
                        pt1 = tg.LatLongs[1];
                        dist = mdlGeodesic.geodesic_distance(pt0, pt1, a12, a21);
                        attitude.value[0] = a12.value[0];
                    }
                    if (SymbolUtilities.isNumber(tg.get_AM())) {
                        width.value[0] = parseFloat(tg.get_AM());
                    }
                    break;
                }

                default: {
                    break;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetNumericFields",
                    new RendererException("Failed inside GetNumericFields", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Do a 360 degree horizontal shift for points on either side of the
     * midpoint of the display, if the MBR for the pixels is greater than 180
     * degrees wide. Builds pixels for two symbols to draw a symbol flipped
     * about the left edge and also a symbol flipped about the right edge. This
     * function is typically used at world view. Caller must instantiate last
     * two parameters.
     *
     * @param tg
     * @param converter
     * @param farLeftPixels - OUT - the resultant pixels for left shift symbol
     * @param farRightPixels - OUT - the result pixels for the right shift
     * symbol
     */
    static GetFarPixels(tg: TGLight,
        converter: IPointConversion,
        farLeftPixels: POINT2[],
        farRightPixels: POINT2[]): void {
        try {
            if (farLeftPixels == null || farRightPixels == null) {
                return;
            }
            //Cannot use tg.LatLon to get width in degrees because it shifts +/-180 at IDL.
            //Get degrees per pixel longitude, will use it for determining width in degrees
            let ptPixels50: Point2D = converter.GeoToPixels(new Point2D(50, 30));
            let ptPixels60: Point2D = converter.GeoToPixels(new Point2D(60, 30));
            let degLonPerPixel: double = 10 / Math.abs(ptPixels60.getX() - ptPixels50.getX());
            let j: int = 0;
            let minX: double = Number.MAX_VALUE;
            let maxX: double = -Number.MAX_VALUE;
            let n: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                if (tg.Pixels[j].x < minX) {
                    minX = tg.Pixels[j].x;
                }
                if (tg.Pixels[j].x > maxX) {
                    maxX = tg.Pixels[j].x;
                }
            }
            let degWidth: double = (maxX - minX) * degLonPerPixel;
            if (Math.abs(degWidth) < 180) {
                return;
            }

            //if it did not return then we must shift the pixels left and right
            //first get the midpoint X value to use for partitioning the points
            let midX: double = Math.abs(180 / degLonPerPixel);
            let x: double = 0;
            let y: double = 0;
            //do a shift about the left hand side
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                x = tg.Pixels[j].x;
                y = tg.Pixels[j].y;
                if (x > midX) {
                    //shift x left by 360 degrees in pixels
                    x -= 2 * midX;
                }
                //else do not shift the point
                //add the shifted (or not) point to the new arraylist
                farLeftPixels.push(new POINT2(x, y));
            }
            //do a shift about the right hand side
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                x = tg.Pixels[j].x;
                y = tg.Pixels[j].y;
                if (x < midX) {
                    //shift x right by 360 degrees in pixels
                    x += 2 * midX;
                }
                //else do not shift the point
                //add the shifted (or not) point to the new arraylist
                farRightPixels.push(new POINT2(x, y));
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetFarPixels",
                    new RendererException("Failed inside GetFarPixels", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     *
     * @param tg
     * @param lineType
     * @param converter
     * @param shapes
     * @return
     */
    static Change1TacticalAreas(tg: TGLight,
        lineType: int, converter: IPointConversion, shapes: Array<Shape2>): boolean {
        try {
            let width: ref<number[]> = new ref();
            let length: ref<number[]> = new ref();
            let attitude: ref<number[]> = new ref();
            let radius: ref<number[]> = new ref();
            let j: int = 0;
            let pt0: POINT2 = tg.LatLongs[0];
            let pt1: POINT2;
            let ptTemp: POINT2 = new POINT2();
            let pt00: POINT2 = new POINT2();
            if (tg.LatLongs.length > 1) {
                pt1 = tg.LatLongs[1];
            } else {
                pt1 = tg.LatLongs[0];
            }
            let pPoints: POINT2[];
            let ptCenter: POINT2 = clsUtilityCPOF.PointLatLongToPixels(pt0, converter);

            clsUtilityCPOF.GetNumericFields(tg, lineType, radius, width, length, attitude);
            switch (lineType) {
                case TacticalLines.LAUNCH_AREA:
                case TacticalLines.DEFENDED_AREA_CIRCULAR:
                case TacticalLines.SHIP_AOI_CIRCULAR: {
                    let ellipsePts: POINT2[] = mdlGeodesic.getGeoEllipse(pt0, width.value[0], length.value[0], attitude.value[0]);
                    for (j = 0; j < ellipsePts.length; j++) //was 103
                    {
                        pt0 = ellipsePts[j];
                        pt1 = clsUtilityCPOF.PointLatLongToPixels(pt0, converter);
                        tg.Pixels.push(pt1);
                    }
                    break;
                }

                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                    //get the upper left corner                    
                    pt00 = mdlGeodesic.geodesic_coordinate(pt0, width.value[0] / 2, attitude.value[0] - 90);
                    pt00 = clsUtilityCPOF.PointLatLongToPixels(pt00, converter);

                    pt00.style = 0;
                    tg.Pixels.push(pt00);

                    //second corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, width.value[0] / 2, attitude.value[0] + 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    //third corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt1, width.value[0] / 2, attitude.value[0] + 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    //fourth corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt1, width.value[0] / 2, attitude.value[0] - 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    tg.Pixels.push(pt00);
                    break;
                }

                case TacticalLines.RECTANGULAR_TARGET: {
                    let pts: POINT2[] = new Array<POINT2>(4); // 4 Corners

                    // get the upper left corner
                    pts[0] = mdlGeodesic.geodesic_coordinate(pt0, width.value[0] / 2, attitude.value[0] - 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(pts[0], converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    // second corner (clockwise from center)
                    pts[1] = mdlGeodesic.geodesic_coordinate(pt0, width.value[0] / 2, attitude.value[0] + 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(pts[1], converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    // third corner (clockwise from center)
                    pts[2] = mdlGeodesic.geodesic_coordinate(pt1, width.value[0] / 2, attitude.value[0] + 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(pts[2], converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    // fourth corner (clockwise from center)
                    pts[3] = mdlGeodesic.geodesic_coordinate(pt1, width.value[0] / 2, attitude.value[0] - 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(pts[3], converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    // Close shape
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(pts[0], converter);
                    ptTemp.style = 5;
                    tg.Pixels.push(ptTemp);

                    let heightD: double = mdlGeodesic.geodesic_distance(pts[0], pts[1], null, null);
                    let widthD: double = mdlGeodesic.geodesic_distance(pts[1], pts[2], null, null);
                    let crossLength: double = Math.min(heightD, widthD) * .4; // Length from center

                    let centerPt: POINT2 = lineutility.CalcCenterPointDouble2(pts, 4);

                    ptTemp = mdlGeodesic.geodesic_coordinate(centerPt, crossLength, 0);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    ptTemp = mdlGeodesic.geodesic_coordinate(centerPt, crossLength, 180);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 5;
                    tg.Pixels.push(ptTemp);

                    ptTemp = mdlGeodesic.geodesic_coordinate(centerPt, crossLength, -90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);

                    ptTemp = mdlGeodesic.geodesic_coordinate(centerPt, crossLength, 90);
                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    ptTemp.style = 0;
                    tg.Pixels.push(ptTemp);
                    break;
                }

                case TacticalLines.RECTANGULAR:
                case TacticalLines.CUED_ACQUISITION: {
                    //AFATDS swap length and width
                    //comment next three lines to render per Mil-Std-2525
                    //double temp=width.value[0];
                    //width.value[0]=length.value[0];
                    //length.value[0]=temp;

                    //get the upper left corner
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, length.value[0] / 2, attitude.value[0] - 90);//was length was -90
                    ptTemp = mdlGeodesic.geodesic_coordinate(ptTemp, width.value[0] / 2, attitude.value[0] + 0);//was width was 0

                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    tg.Pixels.push(ptTemp);
                    //second corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, length.value[0] / 2, attitude.value[0] + 90);  //was length was +90
                    ptTemp = mdlGeodesic.geodesic_coordinate(ptTemp, width.value[0] / 2, attitude.value[0] + 0);   //was width was 0

                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);

                    tg.Pixels.push(ptTemp);

                    //third corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, length.value[0] / 2, attitude.value[0] + 90);//was length was +90
                    ptTemp = mdlGeodesic.geodesic_coordinate(ptTemp, width.value[0] / 2, attitude.value[0] + 180);//was width was +180

                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);

                    tg.Pixels.push(ptTemp);

                    //fouth corner (clockwise from center)
                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, length.value[0] / 2, attitude.value[0] - 90);//was length was -90
                    ptTemp = mdlGeodesic.geodesic_coordinate(ptTemp, width.value[0] / 2, attitude.value[0] + 180);//was width was +180

                    ptTemp = clsUtilityCPOF.PointLatLongToPixels(ptTemp, converter);
                    tg.Pixels.push(ptTemp);
                    tg.Pixels.push(new POINT2(tg.Pixels[0].x, tg.Pixels[0].y));
                    break;
                }

                case TacticalLines.CIRCULAR:
                case TacticalLines.BDZ:
                case TacticalLines.FSA_CIRCULAR:
                case TacticalLines.NOTACK:
                case TacticalLines.ACA_CIRCULAR:
                case TacticalLines.FFA_CIRCULAR:
                case TacticalLines.NFA_CIRCULAR:
                case TacticalLines.RFA_CIRCULAR:
                case TacticalLines.PAA_CIRCULAR:
                case TacticalLines.ATI_CIRCULAR:
                case TacticalLines.CFFZ_CIRCULAR:
                case TacticalLines.SENSOR_CIRCULAR:
                case TacticalLines.CENSOR_CIRCULAR:
                case TacticalLines.DA_CIRCULAR:
                case TacticalLines.CFZ_CIRCULAR:
                case TacticalLines.ZOR_CIRCULAR:
                case TacticalLines.TBA_CIRCULAR:
                case TacticalLines.TVAR_CIRCULAR:
                case TacticalLines.KILLBOXBLUE_CIRCULAR:
                case TacticalLines.KILLBOXPURPLE_CIRCULAR: {
                    //get a horizontal point on the radius
                    pt0 = tg.LatLongs[0];

                    ptTemp = mdlGeodesic.geodesic_coordinate(pt0, radius.value[0], 90);

                    pPoints = new Array<POINT2>(3);
                    pPoints[0] = new POINT2(pt0);
                    pPoints[1] = new POINT2(ptTemp);
                    pPoints[2] = new POINT2(ptTemp);

                    let pPoints2: Array<POINT2> = mdlGeodesic.GetGeodesicArc(pPoints);
                    let ptTemp2: POINT2;
                    //fill pixels and latlongs
                    for (j = 0; j < pPoints2.length; j++) //was 103
                    {
                        pt0 = pPoints2[j];
                        ptTemp2 = new POINT2();
                        ptTemp2 = clsUtilityCPOF.PointLatLongToPixels(pt0, converter);

                        tg.Pixels.push(ptTemp2);
                    }
                    break;
                }

                case TacticalLines.RANGE_FAN: {
                    //get the concentric circles
                    clsUtilityCPOF.GetConcentricCircles(tg, lineType, converter);
                    //Mil-Std-2525 Rev C does not have the orientation arrow
                    //assume we are using Rev C if there is only 1 anchor point
                    if (tg.LatLongs.length > 1) {
                        clsUtilityCPOF.RangeFanOrientation(tg, lineType, converter);
                    }
                    break;
                }

                case TacticalLines.RANGE_FAN_SECTOR: {
                    clsUtilityCPOF.GetSectorRangeFan(tg, converter);
                    clsUtilityCPOF.RangeFanOrientation(tg, lineType, converter);
                    break;
                }

                case TacticalLines.RADAR_SEARCH: {
                    clsUtilityCPOF.GetSectorRangeFan(tg, converter);
                    break;
                }

                case TacticalLines.RANGE_FAN_FILL: {  //circular range fan calls Change1TacticalAreas twice
                    clsUtilityCPOF.GetSectorRangeFan(tg, converter);
                    break;
                }

                default: {
                    return false;
                }

            }

            //the shapes
            let farLeftPixels: Array<POINT2> = new Array();
            let farRightPixels: Array<POINT2> = new Array();
            clsUtilityCPOF.GetFarPixels(tg, converter, farLeftPixels, farRightPixels);
            let shapesLeft: Array<Shape2> = new Array();
            let shapesRight: Array<Shape2> = new Array();
            //ArrayList<Shape2>shapes=null;   //use this to collect all the shapes

            if (farLeftPixels.length === 0 || farRightPixels.length === 0) {
                //diagnostic
                //Change1PixelsToShapes(tg,shapes);
                let tempPixels: Array<POINT2> = new Array();
                tempPixels.push(...tg.Pixels);
                clsUtilityCPOF.postSegmentFSA(tg, converter);
                clsUtilityCPOF.Change1PixelsToShapes(tg, shapes, false);
                //reuse the original pixels for the subsequent call to AddModifier2
                tg.Pixels = tempPixels;
                //end section
            } else //symbol was more than 180 degrees wide, use left and right symbols
            {
                //set tg.Pixels to the left shapes for the call to Change1PixelsToShapes
                tg.Pixels = farLeftPixels;
                clsUtilityCPOF.Change1PixelsToShapes(tg, shapesLeft, false);
                //set tg.Pixels to the right shapes for the call to Change1PixelsToShapes
                tg.Pixels = farRightPixels;
                clsUtilityCPOF.Change1PixelsToShapes(tg, shapesRight, false);
                //load left and right shapes into shapes
                shapes.push(...shapesLeft);
                shapes.push(...shapesRight);
            }
            return true;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "Change1TacticalAreas",
                    new RendererException("Failed inside Change1TacticalAreas", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }

    /**
     * build shapes arraylist from tg.Pixels for the Change 1 symbols
     *
     * @param tg
     * @param shapes - OUT - caller instantiates the arraylist
     */
    private static Change1PixelsToShapes(tg: TGLight, shapes: Array<Shape2>, fill: boolean): void {
        let shape: Shape2;
        let beginLine: boolean = true;
        let currentPt: POINT2;
        let lastPt: POINT2;
        let k: int = 0;
        let linetype: int = tg.get_LineType();
        let n: int = tg.Pixels.length;
        //a loop for the outline shapes            
        //for (k = 0; k < tg.Pixels.length; k++)
        for (k = 0; k < n; k++) {
            //use shapes instead of pixels
            if (shape == null) {
                //shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                if (!fill) {

                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                }

                else {
                    if (fill) {

                        shape = new Shape2(Shape2.SHAPE_TYPE_FILL);
                    }

                }

            }

            currentPt = tg.Pixels[k];
            if (k > 0) {
                lastPt = tg.Pixels[k - 1];
            }

            if (beginLine) {
                if (k === 0) {
                    shape.set_Style(currentPt.style);
                }

                if (k > 0) //doubled points with linestyle=5
                {
                    if (currentPt.style === 5 && lastPt.style === 5) {
                        shape.lineTo(currentPt);
                    }
                }

                shape.moveTo(currentPt);
                beginLine = false;
            } else {
                shape.lineTo(currentPt);
                if (currentPt.style === 5 || currentPt.style === 10) {
                    beginLine = true;
                    //unless there are doubled points with style=5
                    if (linetype === TacticalLines.RANGE_FAN_FILL && k < tg.Pixels.length - 1) {
                        shapes.push(shape);
                        shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    }
                }
            }
            if (k === tg.Pixels.length - 1) //PBS shapes have 2 shapes, other non-LC symbols have 1 shape
            {
                //shapes.push(shape);
                if (shape.getShapeType() === ShapeInfo.SHAPE_TYPE_FILL) {

                    shapes.splice(0, 0, shape);
                }

                else {

                    shapes.push(shape);
                }

            }
        }   //end for

    }

    private static GetConcentricCircles(tg: TGLight, lineType: int, converter: IPointConversion): void {
        try {
            let j: int = 0;
            let l: int = 0;
            let radius: double = 0;

            let pt: POINT2 = new POINT2();
            let pts: Array<POINT2> = new Array();
            let radii: number[]; // AM
            let strAM: string = tg.get_AM();
            if (tg.LatLongs.length === 1 && strAM != null) {
                let strs: string[] = strAM.split(",");
                radii = new Array<number>(strs.length);
                for (j = 0; j < strs.length; j++) {
                    radii[j] = parseFloat(strs[j]);
                }
            }

            let n: int = radii.length;

            //loop thru the circles
            let pPoints: POINT2[];
            for (l = 0; l < n; l++) {
                radius = radii[l];
                if (radius === 0) {
                    continue;
                }

                pPoints = new Array<POINT2>(3);
                pt = tg.LatLongs[0];
                pPoints[0] = new POINT2(pt);
                //radius, 90, ref lon2c, ref lat2c);
                pt = mdlGeodesic.geodesic_coordinate(pt, radius, 90);
                pPoints[1] = new POINT2(pt);
                pPoints[2] = new POINT2(pt);

                pts = mdlGeodesic.GetGeodesicArc(pPoints);

                let ptTemp2: POINT2;
                //fill pixels and latlongs
                let t: int = pts.length;
                //for (j = 0; j < pts.length; j++)//was 103
                for (j = 0; j < t; j++)//was 103
                {
                    ptTemp2 = new POINT2();
                    ptTemp2 = clsUtilityCPOF.PointLatLongToPixels(pts[j], converter);
                    ptTemp2.style = 0;
                    if (j === pts.length - 1) {
                        ptTemp2.style = 5;
                    }

                    tg.Pixels.push(ptTemp2);
                }
            }
            let length: int = tg.Pixels.length;
            tg.Pixels[length - 1].style = 5;

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetConcentricCircles",
                    new RendererException("Failed inside GetConcentricCircles", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * if tg.H2 is filled then the max range sector is used to determine the
     * orientation
     *
     * @param tg
     * @return left,right,min,max
     */
    private static GetMaxSector(tg: TGLight): string | null {
        let strLeftRightMinMax: string;
        try {
            let max: double = 0;
            let maxx: double = -Number.MAX_VALUE;
            //get the number of sectors
            strLeftRightMinMax = tg.get_LRMM();
            let leftRightMinMax: string[] = strLeftRightMinMax.split(",");
            let numSectors: int = leftRightMinMax.length / 4;
            let k: int = 0;
            let maxIndex: int = -1;
            //there must be at least one sector
            if (numSectors < 1) {
                return null;
            }

            if (numSectors * 4 !== leftRightMinMax.length) {
                return null;
            }
            //get the max index

            for (k = 0; k < numSectors; k++) {
                //left = Double.parseFloat(leftRightMinMax[4 * k]);
                //right = Double.parseFloat(leftRightMinMax[4 * k + 1]);
                //min = Double.parseFloat(leftRightMinMax[4 * k + 2]);
                max = parseFloat(leftRightMinMax[4 * k + 3]);
                if (max > maxx) {
                    maxx = max;
                    maxIndex = k;
                }
            }

            let strLeft: string = leftRightMinMax[4 * maxIndex];
            let strRight: string = leftRightMinMax[4 * maxIndex + 1];
            let strMin: string = leftRightMinMax[4 * maxIndex + 2];
            let strMax: string = leftRightMinMax[4 * maxIndex + 3];
            strLeftRightMinMax = strLeft + "," + strRight + "," + strMin + "," + strMax;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetMaxSector",
                    new RendererException("Failed inside GetMaxSector", exc));
            } else {
                throw exc;
            }
        }
        return strLeftRightMinMax;
    }

    /**
     * Create a tg with a new line type to used for circular range fan fill
     *
     * @param tg
     * @return
     */
    static GetCircularRangeFanFillTG(tg: TGLight): TGLight {
        let tg1: TGLight;
        try {
            //instantiate a dummy tg which will be used to call GetSectorRangeFan
            tg1 = new TGLight();
            tg1.set_VisibleModifiers(true);
            tg1.set_LineThickness(0);
            tg1.set_FillColor(tg.get_FillColor());
            tg1.set_Fillstyle(tg.get_FillStyle());
            tg1.LatLongs = new Array<POINT2>();
            tg1.Pixels = new Array<POINT2>();
            //we only want the 0th point
            tg1.LatLongs.push(tg.LatLongs[0]);
            tg1.Pixels.push(tg.Pixels[0]);
            tg1.Pixels.push(tg.Pixels[1]);
            tg1.set_LineType(TacticalLines.RANGE_FAN_FILL);

            if (tg.get_LineType() === TacticalLines.RANGE_FAN_SECTOR || tg.get_LineType() === TacticalLines.RADAR_SEARCH) {
                tg1.set_LRMM(tg.get_LRMM());
                return tg1;
            } else {
                if (tg.get_LineType() === TacticalLines.RANGE_FAN) {
                    let radii: string[] = tg.get_AM().split(",");
                    let strLeftRightMinMax: string = "";
                    for (let j: int = 0; j < radii.length - 1; j++) {
                        if (j > 0) {
                            strLeftRightMinMax += ",";
                        }

                        strLeftRightMinMax += "0,0," + radii[j] + "," + radii[j + 1];
                    }
                    tg1.set_LRMM(strLeftRightMinMax);
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetCircularRangeFanFillTG",
                    new RendererException("Failed inside GetCircularRangeFanFillTG", exc));
            } else {
                throw exc;
            }
        }
        return tg1;
    }

    /**
     *
     * @param tg
     * @param converter
     * @return
     */
    private static GetSectorRangeFan(tg: TGLight, converter: IPointConversion): boolean {
        let circle: boolean = false;
        try {
            let ptCenter: POINT2 = tg.LatLongs[0];
            let k: int = 0;
            let l: int = 0;
            let numSectors: int = 0;
            clsUtilityJTR.GetSectorRadiiFromPoints(tg);

            //use pPoints to get each geodesic arc
            let pPoints: Array<POINT2> = new Array();
            let pPointsInnerArc: Array<POINT2> = new Array();
            let pPointsOuterArc: Array<POINT2> = new Array();
            let sectorPoints: Array<POINT2> = new Array();
            let allPoints: Array<POINT2> = new Array();

            //use these and the center to define each sector
            let pt1: POINT2 = new POINT2();
            let pt2: POINT2 = new POINT2();

            //get the number of sectors
            let strLeftRightMinMax: string = tg.get_LRMM();
            let leftRightMinMax: string[] = strLeftRightMinMax.split(",");

            //sanity checks
            let left: double = 0;
            let right: double = 0;
            let min: double = 0;
            let max: double = 0;
            numSectors = leftRightMinMax.length / 4;

            //there must be at least one sector
            if (numSectors < 1) {
                return false;
            }

            if (numSectors * 4 !== leftRightMinMax.length) {
                return false;
            }

            //left must be  less than right,
            //min must be less than max, each sector

            for (k = 0; k < numSectors; k++) {
                left = parseFloat(leftRightMinMax[4 * k]);
                right = parseFloat(leftRightMinMax[4 * k + 1]);
                min = parseFloat(leftRightMinMax[4 * k + 2]);
                max = parseFloat(leftRightMinMax[4 * k + 3]);
            }



            for (k = 0; k < numSectors; k++) //was k=0
            {
                //empty any points that were there from the last sector
                sectorPoints.length = 0; // sectorPoints.clear()
                pPointsOuterArc.length = 0; // pPointsOuterArc.clear()
                pPointsInnerArc.length = 0; // pPointsInnerArc.clear()

                left = parseFloat(leftRightMinMax[4 * k]);
                right = parseFloat(leftRightMinMax[4 * k + 1]);
                min = parseFloat(leftRightMinMax[4 * k + 2]);
                max = parseFloat(leftRightMinMax[4 * k + 3]);

                //get the first point of the sector inner arc
                pt1 = mdlGeodesic.geodesic_coordinate(ptCenter, min, left);

                //get the last point of the sector inner arc
                pt2 = mdlGeodesic.geodesic_coordinate(ptCenter, min, right);

                pPoints.length = 0; // pPoints.clear()

                pPoints.push(ptCenter);
                pPoints.push(pt1);
                pPoints.push(pt2);

                circle = mdlGeodesic.GetGeodesicArc2(pPoints, pPointsInnerArc);

                pPoints.length = 0; // pPoints.clear()
                circle = false;

                pt1 = mdlGeodesic.geodesic_coordinate(ptCenter, max, left);
                pt2 = mdlGeodesic.geodesic_coordinate(ptCenter, max, right);

                pPoints.push(ptCenter);
                pPoints.push(pt1);
                pPoints.push(pt2);

                //get the geodesic min arc from left to right
                circle = mdlGeodesic.GetGeodesicArc2(pPoints, pPointsOuterArc);

                //we now have all the points and can add them to the polygon to return
                //we will have to reverse the order of points in the outer arc
                let n: int = pPointsInnerArc.length;
                for (l = 0; l < n; l++) {
                    pt1 = new POINT2(pPointsInnerArc[l]);
                    sectorPoints.push(pt1);
                }
                n = pPointsOuterArc.length;
                //for (l = pPointsOuterArc.length - 1; l >= 0; l--)
                for (l = n - 1; l >= 0; l--) {
                    pt1 = new POINT2(pPointsOuterArc[l]);
                    sectorPoints.push(pt1);
                }

                //close the polygon
                pt1 = new POINT2(pPointsInnerArc[0]);
                pt1.style = 5;
                sectorPoints.push(pt1);
                n = sectorPoints.length;
                //for (l = 0; l < sectorPoints.length; l++)
                for (l = 0; l < n; l++) {
                    allPoints.push(sectorPoints[l]);
                }
            }

            //cleanup what we can
            pPointsInnerArc = null;
            pPointsOuterArc = null;
            ptCenter = null;

            let ptTemp: POINT2;
            let n: int = allPoints.length;
            //for (l = 0; l < allPoints.length; l++)
            for (l = 0; l < n; l++) {
                pt1 = new POINT2();
                pt1 = clsUtilityCPOF.PointLatLongToPixels(allPoints[l], converter);
                //do not add duplicates
                if (ptTemp != null && pt1.x === ptTemp.x && pt1.y === ptTemp.y) {
                    continue;
                }
                tg.Pixels.push(new POINT2(pt1));
                ptTemp = new POINT2(pt1);
            }

            return true;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "GetSectorRangeFan",
                    new RendererException("Failed inside GetSectorRangeFan", exc));
            } else {
                throw exc;
            }
        }
        return circle;
    }

    private static RangeFanOrientation(tg: TGLight, lineType: int, converter: IPointConversion): void {
        try {
            let pt0: POINT2 = tg.LatLongs[0];
            let dist: double = 0;
            let orientation: double = 0;
            let radius: double = 0;
            //double[] radii = clsUtility.GetRadii(tg,lineType);
            let j: int = 0;
            let pt1: POINT2 = new POINT2();
            //if tg.PointCollection has more than one point
            //we use pts[1] to stuff tg.H with the orientation
            let a12: ref<number[]> = new ref();
            let a21: ref<number[]> = new ref();
            if (tg.LatLongs.length > 1) //rev B can use points
            {
                pt1 = tg.LatLongs[1];
                dist = mdlGeodesic.geodesic_distance(pt0, pt1, a12, a21);
                orientation = a12.value[0];
            } else //rev C uses H2
            {
                let strLeftRightMinMax: string = clsUtilityCPOF.GetMaxSector(tg);
                let sector: string[] = strLeftRightMinMax.split(",");
                let left: double = parseFloat(sector[0]);
                let right: double = parseFloat(sector[1]);
                let min: double = parseFloat(sector[2]);
                let max: double = parseFloat(sector[3]);
                //we want the range to be 0 to 360
                while (left > 360) {
                    left -= 360;
                }
                while (right > 360) {
                    right -= 360;
                }
                while (left < 0) {
                    left += 360;
                }
                while (right < 0) {
                    right += 360;
                }

                if (left > right) {
                    orientation = (left - 360 + right) / 2;
                } else {
                    orientation = (left + right) / 2;
                }

                dist = max;
            }
            radius = dist * 1.1;
            let pt0F: POINT2 = new POINT2();
            let pt1F: POINT2 = new POINT2();
            let ptBaseF: POINT2 = new POINT2();
            let ptLeftF: POINT2 = new POINT2();
            let ptRightF: POINT2 = new POINT2();
            let ptTipF: POINT2 = new POINT2();

            pt0 = tg.LatLongs[0];

            pt0F = clsUtilityCPOF.PointLatLongToPixels(pt0, converter);

            pt1 = mdlGeodesic.geodesic_coordinate(pt0, radius, orientation);

            pt1F = clsUtilityCPOF.PointLatLongToPixels(pt1, converter);
            dist = lineutility.CalcDistanceDouble(pt0F, pt1F);
            let base: double = 10;
            if (dist < 100) {
                base = dist / 10;
            }
            if (base < 5) {
                base = 5;
            }
            let basex2: double = 2 * base;
            ptBaseF = lineutility.ExtendAlongLineDouble(pt0F, pt1F, dist + base);   //was 10
            ptTipF = lineutility.ExtendAlongLineDouble(pt0F, pt1F, dist + basex2);  //was 20

            ptLeftF = lineutility.ExtendDirectedLine(pt0F, ptBaseF, ptBaseF, 0, base);    //was 10
            ptRightF = lineutility.ExtendDirectedLine(pt0F, ptBaseF, ptBaseF, 1, base);   //was 10
            //length1 = tg.Pixels.length;

            tg.Pixels.push(pt0F);
            ptTipF.style = 5;
            tg.Pixels.push(ptTipF);
            tg.Pixels.push(ptLeftF);
            ptTipF.style = 0;
            tg.Pixels.push(ptTipF);
            tg.Pixels.push(ptRightF);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "RangeFanOrientation",
                    new RendererException("Failed inside RangeFanOrientation", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * after filtering pixels it needs to reinitialize the style to 0 or it
     * causes CELineArraydotNet to build wrong shapes
     *
     * @param tg
     */
    static ClearPixelsStyle(tg: TGLight): void {
        try {
            //do not clear pixel style for the air corridors because
            //arraysupport is using linestyle for these to set the segment width         
            switch (tg.get_LineType()) {
                case TacticalLines.SC:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.TC:
                case TacticalLines.LLTR:
                case TacticalLines.AC:
                case TacticalLines.SAAFR: {
                    return;
                }

                default: {
                    break;
                }


            }
            let n: int = tg.Pixels.length;
            //for(int j=0;j<tg.Pixels.length;j++)            
            for (let j: int = 0; j < n; j++) {
                tg.Pixels[j].style = 0;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "ClearPixelsStyle",
                    new RendererException("Failed inside ClearPixelsStyle", exc));

            } else {
                throw exc;
            }
        }
    }

    /**
     * Filters too close points after segmenting and clipping
     *
     * @param tg
     * @param converter
     */
    static FilterPoints2(tg: TGLight, converter: IPointConversion): void {
        try {
            let lineType: int = tg.get_LineType();
            let minSpikeDistance: double = 0;
            let segmented: boolean = true;
            if (tg.Pixels.length < 3) {
                return;
            }

            switch (lineType) {
                case TacticalLines.PL:
                case TacticalLines.FEBA:
                case TacticalLines.LOA:
                case TacticalLines.LL:
                case TacticalLines.EWL:
                case TacticalLines.FCL:
                case TacticalLines.LOD:
                case TacticalLines.LDLC:
                case TacticalLines.PLD:
                case TacticalLines.HOLD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.BRDGHD:
                case TacticalLines.BRDGHD_GE:
                case TacticalLines.NFL: {
                    minSpikeDistance = arraysupport.getScaledSize(5, tg.get_LineThickness());
                    segmented = false;
                    break;
                }

                case TacticalLines.ATDITCH:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.FLOT:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.FORTL:
                case TacticalLines.STRONG: {
                    minSpikeDistance = arraysupport.getScaledSize(25, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.LC:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ZONE:
                case TacticalLines.LINE:
                case TacticalLines.ATWALL:
                //case TacticalLines.ATWALL3D:
                case TacticalLines.UNSP:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE: {
                    minSpikeDistance = arraysupport.getScaledSize(35, tg.get_LineThickness());
                    break;
                }

                case TacticalLines.ICE_EDGE_RADAR:  //METOCs
                case TacticalLines.ICE_OPENINGS_FROZEN:
                case TacticalLines.CRACKS_SPECIFIC_LOCATION: {
                    minSpikeDistance = arraysupport.getScaledSize(35, tg.get_LineThickness());
                    break;
                }

                default: {
                    return;
                }

            }
            let dist: double = 0;

            let pts: Array<POINT2> = new Array();

            //stuff pts with tg.Pixels
            //loop through pts to remove any points which are too close
            //then reset tg.Pixels with the new array with boundary points removed,            
            let j: int = 0;
            let pt: POINT2;
            let pt0: POINT2;
            let pt1: POINT2;
            let n: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < n; j++) {
                pt = tg.Pixels[j];
                pt.style = tg.Pixels[j].style;
                pts.push(pt);
            }

            let removedPt: boolean = true;
            //order of priority is: keep anchor points, then boundary points, then segmented points
            outer:
            while (removedPt === true) {
                removedPt = false;
                //n=pts.length;
                for (j = 0; j < pts.length - 1; j++) {
                    pt0 = pts[j];
                    pt1 = pts[j + 1];
                    dist = lineutility.CalcDistanceDouble(pts[j], pts[j + 1]);
                    if (dist < minSpikeDistance) {
                        if (segmented === false) {
                            if (j + 1 === pts.length - 1) {
                                pts.splice(j, 1);
                            } else {
                                pts.splice(j + 1, 1);
                            }

                            removedPt = true;
                            break outer;
                        } else if (pt0.style === 0 && pt1.style === -1)//-1 are clipped boundary points
                        {
                            pts.splice(j + 1, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === 0 && pt1.style === -2)//-2 are segmented points, this should never happen
                        {
                            pts.splice(j + 1, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -1 && pt1.style === 0) {
                            pts.splice(j, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -1 && pt1.style === -1) {
                            pts.splice(j + 1, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -1 && pt1.style === -2) {
                            pts.splice(j + 1, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -2 && pt1.style === 0)//this should never happen
                        {
                            pts.splice(j, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -2 && pt1.style === -1) {
                            pts.splice(j, 1);
                            removedPt = true;
                            break outer;
                        } else if (pt0.style === -2 && pt1.style === -2) {
                            pts.splice(j + 1, 1);
                            removedPt = true;
                            break outer;
                        }
                    }
                    //n=pts.length;
                }
            }
            tg.Pixels = pts;
            tg.LatLongs = clsUtility.PixelsToLatLong(pts, converter);

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "FilterPoints2",
                    new RendererException("Failed inside FilterPoints2", exc));

            } else {
                throw exc;
            }
        }
    }

    /**
     * returns true if the line type can be clipped before calculating the
     * shapes
     *
     * @param tg tactical graphic
     * @return true if can pre-clip points
     */
    public static canClipPoints(tg: TGLight): boolean {
        try {
            let symbolId: string = tg.get_SymbolId();
            if (clsMETOC.IsWeather(symbolId) > 0) {
                return true;
            }

            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.ABATIS:
                //                case TacticalLines.BOUNDARY:
                case TacticalLines.FLOT:
                case TacticalLines.LC:
                case TacticalLines.PL:
                case TacticalLines.FEBA:
                case TacticalLines.LL:
                case TacticalLines.EWL:
                case TacticalLines.GENERAL:
                case TacticalLines.JTAA:
                case TacticalLines.SAA:
                case TacticalLines.SGAA:
                case TacticalLines.ASSY:
                case TacticalLines.EA:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.DZ:
                case TacticalLines.EZ:
                case TacticalLines.LZ:
                case TacticalLines.PZ:
                case TacticalLines.LAA:
                case TacticalLines.ROZ:
                case TacticalLines.AARROZ:
                case TacticalLines.UAROZ:
                case TacticalLines.WEZ:
                case TacticalLines.FEZ:
                case TacticalLines.JEZ:
                case TacticalLines.FAADZ:
                case TacticalLines.HIDACZ:
                case TacticalLines.MEZ:
                case TacticalLines.LOMEZ:
                case TacticalLines.HIMEZ:
                case TacticalLines.WFZ:
                case TacticalLines.AIRFIELD:
                case TacticalLines.BATTLE:
                case TacticalLines.PNO:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.DIRATKGND:
                case TacticalLines.DIRATKSPT:
                case TacticalLines.FCL:
                case TacticalLines.HOLD:
                case TacticalLines.BRDGHD:
                case TacticalLines.HOLD_GE:
                case TacticalLines.BRDGHD_GE:
                case TacticalLines.LOA:
                case TacticalLines.LOD:
                case TacticalLines.LDLC:
                case TacticalLines.PLD:
                case TacticalLines.ASSAULT:
                case TacticalLines.ATKPOS:
                case TacticalLines.OBJ:
                case TacticalLines.PEN:
                case TacticalLines.RELEASE:
                case TacticalLines.HOL:
                case TacticalLines.BHL:
                case TacticalLines.AO:
                case TacticalLines.AIRHEAD:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.NAI:
                case TacticalLines.TAI:
                case TacticalLines.BASE_CAMP_REVD:
                case TacticalLines.BASE_CAMP:
                case TacticalLines.GUERILLA_BASE_REVD:
                case TacticalLines.GUERILLA_BASE:
                case TacticalLines.GENERIC_AREA:
                case TacticalLines.LINE:
                case TacticalLines.ZONE:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.ATDITCH:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.ATWALL:
                case TacticalLines.DEPICT:
                case TacticalLines.MINED:
                case TacticalLines.FENCED:
                case TacticalLines.UXO:
                case TacticalLines.UNSP:
                case TacticalLines.SFENCE:
                case TacticalLines.DFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.LWFENCE:
                case TacticalLines.HWFENCE:
                case TacticalLines.SINGLEC:
                case TacticalLines.DOUBLEC:
                case TacticalLines.TRIPLE:
                case TacticalLines.FORTL:
                case TacticalLines.STRONG:
                case TacticalLines.RAD:
                case TacticalLines.BIO:
                case TacticalLines.NUC:
                case TacticalLines.CHEM:
                case TacticalLines.DRCL:
                case TacticalLines.LINTGT:
                case TacticalLines.LINTGTS:
                case TacticalLines.FPF:
                case TacticalLines.FSCL:
                case TacticalLines.BCL_REVD:
                case TacticalLines.BCL:
                case TacticalLines.ICL:
                case TacticalLines.IFF_OFF:
                case TacticalLines.IFF_ON:
                case TacticalLines.GENERIC_LINE:
                case TacticalLines.CFL:
                case TacticalLines.OVERHEAD_WIRE:
                case TacticalLines.NFL:
                case TacticalLines.MFP:
                case TacticalLines.RFL:
                case TacticalLines.AT:
                case TacticalLines.SERIES:
                case TacticalLines.STRIKWARN:
                case TacticalLines.SMOKE:
                case TacticalLines.BOMB:
                case TacticalLines.FSA:
                case TacticalLines.ACA:
                case TacticalLines.FFA:
                case TacticalLines.NFA:
                case TacticalLines.RFA:
                case TacticalLines.PAA:
                case TacticalLines.ATI:
                case TacticalLines.CFFZ:
                case TacticalLines.CFZ:
                case TacticalLines.SENSOR:
                case TacticalLines.CENSOR:
                case TacticalLines.DA:
                case TacticalLines.ZOR:
                case TacticalLines.TBA:
                case TacticalLines.TVAR:
                case TacticalLines.KILLBOXBLUE:
                case TacticalLines.KILLBOXPURPLE:
                //                case TacticalLines.MSR:
                //                case TacticalLines.ASR:
                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT:
                case TacticalLines.DHA_REVD:
                case TacticalLines.DHA:
                case TacticalLines.EPW:
                case TacticalLines.FARP:
                case TacticalLines.RHA:
                case TacticalLines.BSA:
                case TacticalLines.DSA:
                case TacticalLines.CSA:
                case TacticalLines.RSA:
                case TacticalLines.TGMF: {
                    return true;
                }

                case TacticalLines.MSR: //post clip these so there are identical points regardless whether segment data is set 10-5-16
                case TacticalLines.ASR:
                case TacticalLines.ROUTE:
                case TacticalLines.BOUNDARY: {
                    return false;
                }

                default: {
                    return false;
                }

            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "canClipPoints",
                    new RendererException("Failed inside canClipPoints", exc));
            } else {
                throw exc;
            }
        }
        return false;
    }

    /**
     * These get clipped so the fill must be treated as a separate shape.
     * Normally lines with fill do not have a separate shape for the fill.
     *
     * @param linetype
     * @return
     */
    static LinesWithSeparateFill(linetype: int, shapes: Array<Shape2>): boolean {
        if (shapes == null) {
            return false;
        }

        switch (linetype) {
            case TacticalLines.MSDZ: {
                return true;
            }

            //treat these as lines: because of the feint they need an extra shape for the fill
            case TacticalLines.OBSFAREA:
            case TacticalLines.OBSAREA:
            case TacticalLines.STRONG:
            case TacticalLines.ZONE:
            case TacticalLines.FORT_REVD:
            case TacticalLines.FORT:
            case TacticalLines.ENCIRCLE:
            //return true;
            case TacticalLines.FIX:
            case TacticalLines.BOUNDARY:
            case TacticalLines.FLOT:
            case TacticalLines.LC:
            case TacticalLines.PL:
            case TacticalLines.FEBA:
            case TacticalLines.LL:
            case TacticalLines.EWL:
            case TacticalLines.AC:
            case TacticalLines.MRR:
            case TacticalLines.SL:
            case TacticalLines.TC:
            case TacticalLines.SAAFR:
            case TacticalLines.SC:
            case TacticalLines.LLTR:
            case TacticalLines.DIRATKAIR:
            case TacticalLines.DIRATKGND:
            case TacticalLines.DIRATKSPT:
            case TacticalLines.FCL:
            case TacticalLines.HOLD:
            case TacticalLines.BRDGHD:
            case TacticalLines.HOLD_GE:
            case TacticalLines.BRDGHD_GE:
            case TacticalLines.LOA:
            case TacticalLines.LOD:
            case TacticalLines.LDLC:
            case TacticalLines.PLD:
            case TacticalLines.RELEASE:
            case TacticalLines.HOL:
            case TacticalLines.BHL:
            case TacticalLines.LINE:
            case TacticalLines.ABATIS:
            case TacticalLines.ATDITCH:
            case TacticalLines.ATDITCHC:
            case TacticalLines.ATDITCHM:
            case TacticalLines.ATWALL:
            case TacticalLines.MNFLDFIX:
            case TacticalLines.UNSP:
            case TacticalLines.SFENCE:
            case TacticalLines.DFENCE:
            case TacticalLines.DOUBLEA:
            case TacticalLines.LWFENCE:
            case TacticalLines.HWFENCE:
            case TacticalLines.SINGLEC:
            case TacticalLines.DOUBLEC:
            case TacticalLines.TRIPLE:
            case TacticalLines.FORTL:
            case TacticalLines.LINTGT:
            case TacticalLines.LINTGTS:
            case TacticalLines.FSCL:
            case TacticalLines.BCL_REVD:
            case TacticalLines.BCL:
            case TacticalLines.ICL:
            case TacticalLines.IFF_OFF:
            case TacticalLines.IFF_ON:
            case TacticalLines.GENERIC_LINE:
            case TacticalLines.CFL:
            case TacticalLines.NFL:
            case TacticalLines.MFP:
            case TacticalLines.RFL:
            case TacticalLines.MSR:
            case TacticalLines.MSR_ONEWAY:
            case TacticalLines.MSR_TWOWAY:
            case TacticalLines.MSR_ALT:
            case TacticalLines.ASR:
            case TacticalLines.ASR_ONEWAY:
            case TacticalLines.ASR_TWOWAY:
            case TacticalLines.ASR_ALT:
            case TacticalLines.ROUTE:
            case TacticalLines.ROUTE_ONEWAY:
            case TacticalLines.ROUTE_ALT: {
                //undo any fill
                let shape: Shape2;
                if (shapes != null && shapes.length > 0) {
                    let n: int = shapes.length;
                    //for(int j=0;j<shapes.length;j++)
                    for (let j: int = 0; j < n; j++) {
                        shape = shapes[j];
                        if (shape.getShapeType() === Shape2.SHAPE_TYPE_POLYLINE) {
                            shapes[j].setFillColor(null);
                        }
                    }
                }
                return true;
            }

            default: {
                return false;
            }


        }
    }

    /**
     * uses a hash map to set the POINT2 style when creating tg.Pixels from
     * Point2D ArrayList
     *
     * @param pts2d
     * @param hashMap
     * @return
     */
    static Point2DtoPOINT2Mapped(pts2d: Array<Point2D>, hashMap: Map<string, Point2D>): Array<POINT2> {
        let pts: Array<POINT2> = new Array();
        try {
            let pt2d: Point2D;
            let style: int = 0;
            let n: int = pts2d.length;
            //for(int j=0;j<pts2d.length;j++)
            for (let j: int = 0; j < n; j++) {
                pt2d = pts2d[j];
                //the hash map contains the original tg.Pixels before clipping
                if (Array.from(hashMap.values()).includes(pt2d)) {
                    style = 0;
                } else {
                    style = -1;   //style set to -1 identifies it as a clip bounds point
                }
                pts.push(new POINT2(pts2d[j].getX(), pts2d[j].getY(), style));
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "Point2DToPOINT2Mapped",
                    new RendererException("Failed inside Point2DToPOINT2Mapped", exc));
            } else {
                throw exc;
            }
        }
        return pts;
    }

    protected static Point2DtoPOINT2(pts2d: Array<Point2D>): Array<POINT2> {
        let pts: Array<POINT2> = new Array();
        try {
            let n: int = pts2d.length;
            //for(int j=0;j<pts2d.length;j++)
            for (let j: int = 0; j < n; j++) {
                pts.push(new POINT2(pts2d[j].getX(), pts2d[j].getY()));
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "Point2DToPOINT2",
                    new RendererException("Failed inside Point2DToPOINT2", exc));
            } else {
                throw exc;
            }
        }
        return pts;
    }

    static POINT2toPoint2D(pts: Array<POINT2>): Array<Point2D> {
        let pts2d: Array<Point2D> = new Array();
        try {
            let n: int = pts.length;
            //for(int j=0;j<pts.length;j++)
            for (let j: int = 0; j < n; j++) {
                pts2d.push(new Point2D(pts[j].x, pts[j].y));;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "POINT2toPoint2D",
                    new RendererException("Failed inside POINT2toPoint2D", exc));
            } else {
                throw exc;
            }
        }
        return pts2d;
    }

    /**
     * Builds a single shape from a point array. Currently we assume the array
     * represents a moveTo followed by a series of lineTo operations
     *
     * @param pts2d
     * @return
     */
    private static BuildShapeFromPoints(pts2d: Array<Point2D>): Shape {
        let shape: GeneralPath = new GeneralPath();
        try {
            shape.moveTo(pts2d[0].getX(), pts2d[0].getY());
            let n: int = pts2d.length;
            //for(int j=1;j<pts2d.length;j++)
            for (let j: int = 1; j < n; j++) {
                shape.lineTo(pts2d[j].getX(), pts2d[j].getY());
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "buildShapeFromPoints",
                    new RendererException("Failed inside buildShapeFromPoints", exc));

            } else {
                throw exc;
            }
        }
        return shape;
    }

    /**
     * Clips a ShapeSpec. Assumes we are not post clipping splines, therefore
     * all the operations are moveTo, lineTo. Each ShapeSpec is assumed to be:
     * moveTo, lineTo ... lineTo, followed by another moveTo, lineTo, ...
     * lineTo, followed by ...
     *
     * @param shapeSpec
     * @param pts
     * @param clipArea
     * @return a single clipped shapeSpec
     */
    protected static buildShapeSpecFromPoints(tg0: TGLight,
        shapeSpec: Shape2, //the original ShapeSpec
        pts: Array<POINT2>,
        clipArea: Rectangle | Rectangle2D | Array<Point2D>): Array<Shape2> {
        let shapeSpecs2: Array<Shape2>;
        let shapeSpec2: Shape2;
        try {
            //create a tg to use for the clip
            shapeSpecs2 = new Array();
            let j: int = 0;
            let n: int = 0;
            //return null if it is outside the bounds
            let rect: Rectangle = shapeSpec.getBounds();
            let h: int = shapeSpec.getBounds().height;
            let w: int = shapeSpec.getBounds().width;
            let x: int = shapeSpec.getBounds().x;
            let y: int = shapeSpec.getBounds().y;
            //            if(h==0 && w==0)
            //                return shapeSpecs2;

            if (h === 0) {
                h = 1;
            }
            if (w === 0) {
                w = 1;
            }

            let clipBounds: Rectangle2D;
            let clipPoints: Array<Point2D>;
            if (clipArea != null && clipArea instanceof Rectangle2D) {
                clipBounds = clipArea as Rectangle2D;
            } else if (clipArea != null && clipArea instanceof Rectangle) {
                //clipBounds=(Rectangle2D)clipArea;
                let rectx: Rectangle = clipArea as Rectangle;
                clipBounds = new Rectangle2D(rectx.x, rectx.y, rectx.width, rectx.height);
            } else if (clipArea != null && clipArea instanceof Array) {
                clipPoints = clipArea as Array<Point2D>;
            }

            if (clipBounds != null && clipBounds.contains(shapeSpec.getShape().getBounds2D()) === false
                && clipBounds.intersects(shapeSpec.getShape().getBounds2D()) === false) {
                //this tests if the shape has height or width 0
                //but may be contained within the clipbounds or intersect it
                //in that case we gave it a default width or thickness of 1
                if (clipBounds.contains(x, y, w, h) === false
                    && clipBounds.intersects(x, y, w, h) === false) {
                    return shapeSpecs2;
                }
            } else {
                if (clipPoints != null) {
                    let poly: GeneralPath = new GeneralPath();
                    n = clipPoints.length;
                    //for(j=0;j<clipPoints.length;j++)
                    for (j = 0; j < n; j++) {
                        if (j === 0) {
                            poly.moveTo(clipPoints[j].getX(), clipPoints[j].getY());
                        } else {
                            poly.lineTo(clipPoints[j].getX(), clipPoints[j].getY());
                        }
                    }
                    poly.closePath();
                    if (poly.contains(shapeSpec.getShape().getBounds2D()) === false
                        && poly.intersects(shapeSpec.getShape().getBounds2D()) === false) {
                        if (poly.contains(x, y, w, h) === false
                            && poly.intersects(x, y, w, h) === false) {
                            return shapeSpecs2;
                        }
                    }
                }
            }


            if (shapeSpec.getShapeType() === Shape2.SHAPE_TYPE_MODIFIER
                || shapeSpec.getShapeType() === Shape2.SHAPE_TYPE_MODIFIER_FILL) {
                shapeSpecs2.push(shapeSpec);
                return shapeSpecs2;
            }
            let tg: TGLight = new TGLight();
            let pt: POINT2;
            tg.set_LineType(TacticalLines.PL);
            let pts2: Array<POINT2> = new Array();
            let pts2d: Array<Point2D>;
            let shape: Shape;
            let gp: GeneralPath = new GeneralPath();
            //loop through the points
            n = pts.length;
            //for(j=0;j<pts.length;j++)
            for (j = 0; j < n; j++) {
                pt = pts[j];
                //new line
                switch (pt.style) {
                    case 0: { //moveTo,
                        //they lifted the pencil, so we build the shape from the existing pts and append it
                        if (pts2.length > 1) {
                            //clip the points
                            tg = new TGLight();
                            tg.set_LineType(TacticalLines.PL);
                            tg.Pixels = pts2;
                            if (clipBounds != null) {
                                pts2d = clsClipPolygon2.ClipPolygon(tg, clipBounds);
                            } else {
                                if (clipPoints != null && clipPoints.length > 0) {
                                    pts2d = clsClipQuad.ClipPolygon(tg, clipPoints);
                                }
                            }


                            //build a GeneralPath from the points we collected, we will append it
                            if (pts2d != null && pts2d.length > 1) {
                                shape = clsUtilityCPOF.BuildShapeFromPoints(pts2d);
                                //append the shape because we want to return only one shape
                                gp.append(shape, false);
                            }
                            //clear the points array and begin the next line
                            pts2.length = 0; // pts2.clear()
                            pts2.push(pt);
                        } else {
                            pts2.push(pt);
                        }
                        break;
                    }

                    case 1: { //lineTo
                        pts2.push(pt);
                        break;
                    }

                    default: {
                        pts2.push(pt);
                        break;
                    }

                }
            }//end for
            //append the last shape
            if (pts2.length > 1) {
                //clip the points
                tg = new TGLight();
                tg.set_LineType(TacticalLines.PL);
                tg.Pixels = pts2;
                if (clipBounds != null) {
                    pts2d = clsClipPolygon2.ClipPolygon(tg, clipBounds);
                } else {
                    if (clipPoints != null) {
                        pts2d = clsClipQuad.ClipPolygon(tg, clipPoints);
                    }
                }

                //build a GeneralPath from the points we collected, we will append it
                if (pts2d != null && pts2d.length > 1) {
                    shape = clsUtilityCPOF.BuildShapeFromPoints(pts2d);
                    gp.append(shape, false);
                }
                tg0.set_WasClipped(tg.get_WasClipped());
            }
            //create the shapespec here
            //initialize the clipped ShapeSpec
            shapeSpec2 = new Shape2(shapeSpec.getShapeType());
            shapeSpec2.setLineColor(shapeSpec.getLineColor());
            shapeSpec2.setFillColor(shapeSpec.getFillColor());
            shapeSpec2.setStroke(shapeSpec.getStroke());
            shapeSpec2.setTexturePaint(shapeSpec.getTexturePaint());
            shapeSpec2.setShape(gp);
            shapeSpecs2.push(shapeSpec2);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "buildShapeSpecFromPoints",
                    new RendererException("Failed inside buildShapeSpecFromPoints", exc));

            } else {
                throw exc;
            }
        }
        return shapeSpecs2;
    }

    /**
     * Currently assumes no MeTOC symbols are post clipped
     *
     * @param tg
     * @param shapeSpecsArray
     * @param clipArea
     * @return
     */
    static postClipShapes(tg: TGLight, shapeSpecsArray: Array<Shape2>, clipArea: Point2D[] | Rectangle | Rectangle2D): Array<Shape2> | null {
        let shapeSpecs2: Array<Shape2>;
        let tempShapes: Array<Shape2>;
        try {
            if (shapeSpecsArray == null || shapeSpecsArray.length === 0) {
                return null;
            }

            shapeSpecs2 = new Array();
            let j: int = 0;
            let shapeSpecs: Array<Shape2> = new Array();
            let n: int = shapeSpecsArray.length;
            //for(j=0;j<shapeSpecsArray.length;j++)
            for (j = 0; j < n; j++) {
                shapeSpecs.push(shapeSpecsArray[j]);;
            }

            let pts: Array<POINT2> = new Array();//use these
            let shape: Shape;
            let pt: POINT2;
            let coords: number[] = new Array<number>(6);
            let shapeSpec: Shape2;
            n = shapeSpecs.length;
            //for(j=0;j<shapeSpecs.length;j++)
            for (j = 0; j < n; j++) {
                shapeSpec = shapeSpecs[j];
                shape = shapeSpec.getShape();
                pts.length = 0; // pts.clear()
                for (let i: PathIterator = shape.getPathIterator(null); !i.isDone(); i.next()) {
                    let type: int = i.currentSegment(coords);
                    switch (type) {
                        case PathIterator.SEG_MOVETO: {
                            pt = new POINT2(coords[0], coords[1]);
                            pt.style = 0;
                            pts.push(pt);
                            break;
                        }

                        case PathIterator.SEG_LINETO: {
                            pt = new POINT2(coords[0], coords[1]);
                            pt.style = 1;
                            pts.push(pt);
                            break;
                        }

                        case PathIterator.SEG_QUADTO: {   //not using this
                            pt = new POINT2(coords[0], coords[1]);
                            pt.style = 2;
                            pts.push(pt);
                            pt = new POINT2(coords[2], coords[3]);
                            pt.style = 2;
                            pts.push(pt);
                            break;
                        }

                        case PathIterator.SEG_CUBICTO: {  //not using this
                            pt = new POINT2(coords[0], coords[1]);
                            pt.style = 3;
                            pts.push(pt);
                            pt = new POINT2(coords[2], coords[3]);
                            pt.style = 3;
                            pts.push(pt);
                            pt = new POINT2(coords[4], coords[5]);
                            pt.style = 3;
                            pts.push(pt);
                            break;
                        }

                        case PathIterator.SEG_CLOSE: {//not using this
                            pt = new POINT2(coords[0], coords[1]);
                            pt.style = 4;
                            pts.push(pt);
                            break;
                        }

                        default: {
                            pt = null;
                            break;
                        }

                    }//end switch
                }   //end for pathiterator i
                tempShapes = clsUtilityCPOF.buildShapeSpecFromPoints(tg, shapeSpec, pts, clipArea);
                shapeSpecs2.push(...tempShapes);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "postClipShapes",
                    new RendererException("Failed inside postClipShapes", exc));
            } else {
                throw exc;
            }
        }
        return shapeSpecs2;
    }

    /**
     * For the 3d map we cannot pre-segment the auto-shapes or fire support
     * areas. We do need to pre-segment generic lines regardless of the status
     * if clipping is set. Currently we are not pre-segmenting axis of advance
     * symbols.
     *
     * @param tg
     * @return true if pre-segmenting is to be used
     */
    private static segmentAnticipatedLine(tg: TGLight): boolean {
        try {
            let linetype: int = tg.get_LineType();
            //do not pre-segment the fire support rectangular and circular areas
            if (clsUtilityJTR.IsChange1Area(linetype)) {
                return false;
            }
            //do not pre-segment the autoshapes
            if (clsUtilityJTR.isAutoshape(tg)) {
                return false;
            }
            //temporarily do not pre-segment the channel types.
            switch (linetype) {
                case TacticalLines.OVERHEAD_WIRE:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.MAIN:
                case TacticalLines.SPT:
                case TacticalLines.AIRAOA:
                case TacticalLines.AAAAA: {
                    return false;
                }

                case TacticalLines.MSR_ONEWAY:
                case TacticalLines.MSR_TWOWAY:
                case TacticalLines.MSR_ALT:
                case TacticalLines.ASR_ONEWAY:
                case TacticalLines.ASR_TWOWAY:
                case TacticalLines.ASR_ALT:
                case TacticalLines.ROUTE_ONEWAY:
                case TacticalLines.ROUTE_ALT: {
                    //added because of segment data 4-22-13
                    //removed from this case block since we now post-clip these because of segment color data 10-5-16
                    //                case TacticalLines.MSR:
                    //                case TacticalLines.ASR:
                    //                case TacticalLines.BOUNDARY:
                    return false;
                }

                default: {
                    break;
                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "segmentGenericLine",
                    new RendererException("Failed inside segmentGenericLine", exc));
            } else {
                throw exc;
            }
        }
        return true;
    }

    /**
     * cannot pre-segment the fire support areas, must post segment them after
     * the pixels were calculated
     *
     * @param tg
     * @param converter
     */
    protected static postSegmentFSA(tg: TGLight,
        converter: IPointConversion): void {
        try {
            if (tg.get_Client() === "2D") {
                return;
            }

            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.FSA_RECTANGULAR:
                case TacticalLines.SHIP_AOI_RECTANGULAR:
                case TacticalLines.DEFENDED_AREA_RECTANGULAR:
                case TacticalLines.FFA_RECTANGULAR:
                case TacticalLines.ACA_RECTANGULAR:
                case TacticalLines.NFA_RECTANGULAR:
                case TacticalLines.RFA_RECTANGULAR:
                case TacticalLines.ATI_RECTANGULAR:
                case TacticalLines.CFFZ_RECTANGULAR:
                case TacticalLines.SENSOR_RECTANGULAR:
                case TacticalLines.CENSOR_RECTANGULAR:
                case TacticalLines.DA_RECTANGULAR:
                case TacticalLines.CFZ_RECTANGULAR:
                case TacticalLines.ZOR_RECTANGULAR:
                case TacticalLines.TBA_RECTANGULAR:
                case TacticalLines.TVAR_RECTANGULAR:
                case TacticalLines.KILLBOXBLUE_RECTANGULAR:
                case TacticalLines.KILLBOXPURPLE_RECTANGULAR: {
                    break;
                }

                default: {
                    return;
                }

            }
            let latLongs: Array<POINT2> = new Array();
            let resultPts: Array<POINT2> = new Array();
            let j: int = 0;
            let k: int = 0;
            let n: int = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt: POINT2;
            let dist: double = 0;
            //double interval=1000000;
            let interval: double = 250000;
            let az: double = 0;

            let maxDist: double = 0;
            let pt2d: Point2D;
            let t: int = tg.Pixels.length;
            //for(j=0;j<tg.Pixels.length;j++)
            for (j = 0; j < t; j++) {
                pt0 = tg.Pixels[j];
                pt2d = new Point2D(pt0.x, pt0.y);
                pt2d = converter.PixelsToGeo(pt2d);
                pt0 = new POINT2(pt2d.getX(), pt2d.getY());
                latLongs.push(pt0);
            }
            t = latLongs.length;
            //for(j=0;j<latLongs.length-1;j++)
            for (j = 0; j < t - 1; j++) {
                pt0 = latLongs[j];
                pt1 = latLongs[j + 1];
                pt1.style = -1;//end point
                az = mdlGeodesic.GetAzimuth(pt0, pt1);
                dist = mdlGeodesic.geodesic_distance(latLongs[j], latLongs[j + 1], null, null);
                if (dist > maxDist) {
                    maxDist = dist;
                }
            }

            if (interval > maxDist) {
                interval = maxDist;
            }

            //for(j=0;j<latLongs.length-1;j++)
            for (j = 0; j < t - 1; j++) {
                pt0 = new POINT2(latLongs[j]);
                pt0.style = 0;//anchor point
                pt1 = new POINT2(latLongs[j + 1]);
                pt1.style = 0;//anchor point point
                az = mdlGeodesic.GetAzimuth(pt0, pt1);
                dist = mdlGeodesic.geodesic_distance(latLongs[j], latLongs[j + 1], null, null);

                n = Math.trunc(dist / interval);
                if (j === 0) {
                    resultPts.push(pt0);
                }

                for (k = 1; k <= n; k++) {
                    pt = mdlGeodesic.geodesic_coordinate(pt0, interval * k, az);
                    pt.style = -2;
                    //we do not want the last segment to be too close to the anchor point
                    //only add the segment point if it is a distance at least half the inteval
                    //from the 2nd anchor point
                    dist = mdlGeodesic.geodesic_distance(pt, pt1, null, null);
                    if (dist >= interval / 2) {
                        resultPts.push(pt);
                    }
                }
                //ad the 2nd anchor point
                resultPts.push(pt1);
            }
            latLongs = resultPts;
            tg.Pixels = clsUtility.LatLongToPixels(latLongs, converter);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "postSegmentFSA",
                    new RendererException("Failed inside postSegmentFSA", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * Similar to Vincenty algorithm for more accurate interpolation of geo
     * anchor points
     *
     * @return the interpolated points
     */
    private static toGeodesic(tg: TGLight, interval: double, hmap: Map<number, string>): Array<POINT2> | null {
        let locs: Array<POINT2> = new Array<POINT2>();
        try {
            let i: int = 0;
            let k: int = 0;
            let n: int = 0;
            let points: Array<POINT2> = tg.LatLongs;
            let H: string = "";
            let color: string = "";
            let bolIsAC: boolean = false;
            let acWidth: int = 0;
            let linetype: int = tg.get_LineType();
            switch (linetype) {
                case TacticalLines.AC:
                case TacticalLines.LLTR:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.SAAFR:
                case TacticalLines.TC:
                case TacticalLines.SC: {
                    bolIsAC = true;
                    break;
                }

                default: {
                    break;
                }

            }
            for (i = 0; i < points.length - 1; i++) {
                if (bolIsAC) {

                    acWidth = points[i].style;
                }

                // Convert coordinates from degrees to Radians
                //var lat1 = points[i].latitude * (PI / 180);
                //var lon1 = points[i].longitude * (PI / 180);
                //var lat2 = points[i + 1].latitude * (PI / 180);
                //var lon2 = points[i + 1].longitude * (PI / 180);                
                let lat1: double = points[i].y * Math.PI / 180.0;
                let lon1: double = points[i].x * Math.PI / 180.0;
                let lat2: double = points[i + 1].y * Math.PI / 180.0;
                let lon2: double = points[i + 1].x * Math.PI / 180.0;
                // Calculate the total extent of the route
                //var d = 2 * asin(sqrt(pow((sin((lat1 - lat2) / 2)), 2) + cos(lat1) * cos(lat2) * pow((sin((lon1 - lon2) / 2)), 2)));
                let d: double = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow((Math.sin((lon1 - lon2) / 2)), 2)));

                let dist: double = mdlGeodesic.geodesic_distance(points[i], points[i + 1], null, null);
                //double dist=d;
                let flt: double = dist / interval;
                n = Math.round(flt);
                if (n < 1) {
                    n = 1;
                }
                if (n > 32) {
                    n = 32;
                }
                // Calculate  positions at fixed intervals along the route
                for (k = 0; k <= n; k++) {
                    //we must preserve the anchor points
                    if (k === 0) {
                        locs.push(new POINT2(points[i]));
                        if (hmap != null && hmap.has(i)) {
                            if (H.length > 0) {
                                H += ",";
                            }
                            color = String(hmap.get(i));
                            H += (locs.length - 1).toString() + ":" + color;
                        }
                        continue;
                    } else {
                        if (k === n) {
                            if (i === points.length - 2) {
                                locs.push(new POINT2(points[i + 1]));
                                if (hmap != null && hmap.has(i + 1)) {
                                    if (H.length > 0) {
                                        H += ",";
                                    }
                                    color = String(hmap.get(i + 1));
                                    H += (locs.length - 1).toString() + ":" + color;
                                }
                            }
                            break;
                        }
                    }

                    //var f = (k / n);
                    //var A = sin((1 - f) * d) / sin(d);
                    //var B = sin(f * d) / sin(d);
                    let f: double = (k as double / n as double);
                    let A: double = Math.sin((1 - f) * d) / Math.sin(d);
                    let B: double = Math.sin(f * d) / Math.sin(d);
                    // Obtain 3D Cartesian coordinates of each point
                    //var x = A * cos(lat1) * cos(lon1) + B * cos(lat2) * cos(lon2);
                    //var y = A * cos(lat1) * sin(lon1) + B * cos(lat2) * sin(lon2);
                    //var z = A * sin(lat1) + B * sin(lat2);
                    let x: double = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
                    let y: double = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
                    let z: double = A * Math.sin(lat1) + B * Math.sin(lat2);
                    // Convert these to latitude/longitude
                    //var lat = atan2(z, sqrt(pow(x, 2) + pow(y, 2)));
                    //var lon = atan2(y, x);
                    let lat: double = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                    let lon: double = Math.atan2(y, x);
                    lat *= 180.0 / Math.PI;
                    lon *= 180.0 / Math.PI;
                    let pt: POINT2 = new POINT2(lon, lat);
                    if (bolIsAC) {

                        pt.style = -acWidth;
                    }

                    locs.push(pt);
                    if (hmap != null && hmap.has(i)) {
                        if (H.length > 0) {
                            H += ",";
                        }
                        color = String(hmap.get(i));
                        H += (locs.length - 1).toString() + ":" + color;
                    }
                }
            }
            if (H.length > 0) {
                tg.set_H(H);
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "toGeodesic",
                    new RendererException("Failed inside toGeodesic", exc));
                return null;
            } else {
                throw exc;
            }
        }
        return locs;
    }

    /**
     * Pre-segment the lines based on max or min latitude for the segment
     * interval. This is necessary because GeoPixelconversion does not work well
     * over distance greater than 1M meters, especially at extreme latitudes.
     *
     * @param tg
     * @param converter
     */
    static SegmentGeoPoints(tg: TGLight,
        converter: IPointConversion,
        zoomFactor: double): void {
        try {
            if (tg.get_Client() === "2D") {
                return;
            }

            let resultPts: Array<POINT2> = new Array();
            let lineType: int = tg.get_LineType();
            //double interval=1000000;
            let interval: double = 250000;
            let bolSegmentAC: boolean = false;
            let bolIsAC: boolean = false;
            bolSegmentAC = true;
            //conservative interval in meters
            //return early for those lines not requiring pre-segmenting geo points
            switch (lineType) {
                case TacticalLines.AC:
                case TacticalLines.LLTR:
                case TacticalLines.MRR:
                case TacticalLines.SL:
                case TacticalLines.SAAFR:
                case TacticalLines.TC:
                case TacticalLines.SC: {
                    if (!bolSegmentAC) {
                        return;
                    }
                    bolIsAC = true;
                    break;
                }

                case TacticalLines.PLD:
                case TacticalLines.CFL:
                case TacticalLines.UNSP:
                case TacticalLines.TRIPLE:
                case TacticalLines.DOUBLEC:
                case TacticalLines.SINGLEC:
                case TacticalLines.ATDITCH:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM:
                case TacticalLines.ATWALL:
                case TacticalLines.LINE:
                case TacticalLines.DIRATKAIR:
                case TacticalLines.STRONG:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.FLOT:
                case TacticalLines.ZONE:
                case TacticalLines.OBSAREA:
                case TacticalLines.OBSFAREA:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.FORTL: {
                    break;
                }

                case TacticalLines.HWFENCE:
                case TacticalLines.LWFENCE:
                case TacticalLines.DOUBLEA:
                case TacticalLines.DFENCE:
                case TacticalLines.SFENCE: {
                    interval = 500000;
                    break;
                }

                case TacticalLines.LC: {
                    interval = 2000000;
                    break;
                }

                default: {
                    //if the line is an anticipated generic line then segment the line
                    if (clsUtilityCPOF.segmentAnticipatedLine(tg)) {
                        break;
                    }
                    return;
                }

            }

            let j: int = 0;
            let k: int = 0;
            let n: int = 0;
            let pt0: POINT2;
            let pt1: POINT2;
            let pt: POINT2;
            let dist: double = 0;
            let az: double = 0;

            let maxDist: double = 0;
            let t: int = tg.LatLongs.length;
            //for(j=0;j<tg.LatLongs.length-1;j++)
            for (j = 0; j < t - 1; j++) {
                pt0 = tg.LatLongs[j];
                pt1 = tg.LatLongs[j + 1];
                if (!bolIsAC) {

                    pt1.style = -1;
                }
                //end point
                az = mdlGeodesic.GetAzimuth(pt0, pt1);
                dist = mdlGeodesic.geodesic_distance(tg.LatLongs[j], tg.LatLongs[j + 1], null, null);
                if (dist > maxDist) {
                    maxDist = dist;
                }
            }

            if (interval > maxDist) {
                interval = maxDist;
            }

            if (zoomFactor > 0 && zoomFactor < 0.01) {
                zoomFactor = 0.01;
            }
            if (zoomFactor > 0 && zoomFactor < 1) {
                interval *= zoomFactor;
            }

            let useVincenty: boolean = false;
            let H: string = "";
            let color: string = "";
            let hmap: Map<number, string> = clsUtilityJTR.getMSRSegmentColorStrings(tg);
            if (hmap != null) {
                tg.set_H("");
            }
            //uncomment one line to use (similar to) Vincenty algorithm
            useVincenty = true;
            if (useVincenty) {
                resultPts = clsUtilityCPOF.toGeodesic(tg, interval, hmap);
                tg.LatLongs = resultPts;
                tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, converter);
                return;
            }

            for (j = 0; j < tg.LatLongs.length - 1; j++) {
                pt0 = new POINT2(tg.LatLongs[j]);
                pt0.style = 0;//anchor point
                pt1 = new POINT2(tg.LatLongs[j + 1]);
                pt1.style = 0;//anchor point point
                az = mdlGeodesic.GetAzimuth(pt0, pt1);
                dist = mdlGeodesic.geodesic_distance(tg.LatLongs[j], tg.LatLongs[j + 1], null, null);

                n = Math.trunc(dist / interval);
                if (j === 0) {
                    resultPts.push(pt0);
                    if (hmap != null && hmap.has(j)) {
                        if (H.length > 0) {
                            H += ",";
                        }
                        color = String(hmap.get(j));
                        //H+=(resultPts.length-1).toString()+":"+color;
                        H += (resultPts.length - 1).toString() + ":" + color;
                    }
                }
                for (k = 1; k <= n; k++) {
                    pt = mdlGeodesic.geodesic_coordinate(pt0, interval * k, az);
                    pt.style = -2;
                    //we do not want the last segment to be too close to the anchor point
                    //only add the segment point if it is a distance at least half the inteval
                    //from the 2nd anchor point
                    dist = mdlGeodesic.geodesic_distance(pt, pt1, null, null);
                    if (dist >= interval / 2) {
                        resultPts.push(pt);
                        if (hmap != null && hmap.has(j)) {
                            color = String(hmap.get(j));
                            if (H.length > 0) {
                                H += ",";
                            }
                            //H+=(resultPts.length-1).toString()+":"+color;
                            H += (resultPts.length - 1).toString() + ":" + color;
                        }
                    }
                }
                //ad the 2nd anchor point
                resultPts.push(pt1);
                if (hmap != null && hmap.has(j + 1)) {
                    if (H.length > 0) {
                        H += ",";
                    }
                    color = String(hmap.get(j + 1));
                    //H+=(resultPts.length-1).toString()+":"+color;
                    H += (resultPts.length - 1).toString() + ":" + color;
                }
            }
            if (H.length > 0) {
                tg.set_H(H);
            }
            tg.LatLongs = resultPts;
            tg.Pixels = clsUtility.LatLongToPixels(tg.LatLongs, converter);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsUtilityCPOF._className, "SegmentGeoPoints",
                    new RendererException("Failed inside SegmentGeoPoints", exc));
            } else {
                throw exc;
            }
        }
    }

}
