import { type int, type double } from "../../c5isr/graphics2d/BasicTypes";

import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { Shape2 } from "../JavaLineArray/Shape2"
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { ErrorLogger } from "../renderer/utilities/ErrorLogger"
import { RendererException } from "../renderer/utilities/RendererException"
import { clsUtility } from "../JavaTacticalRenderer/clsUtility"
import { clsUtilityCPOF } from "../RenderMultipoints/clsUtilityCPOF"
import { clsUtilityGE } from "../RenderMultipoints/clsUtilityGE"
import { Point2D } from "../graphics2d/Point2D";
import { Polygon } from "../graphics2d/Polygon";
import { Line2D } from "../graphics2d/Line2D";


/**
 * Class to clip polygons
 *
 */
export class clsClipQuad {
    private static readonly _className: string = "clsClipQuad";
    /**
     * Use the new version which takes an array for polygon clip bounds instead of rectangle
     * @param polygon
     * @param clipBounds
     * @return 
     */
    private static AddBoundaryPointsForLines(polygon: Array<Point2D>,
        clipBounds: Array<Point2D>): int {
        let result: int = 0;
        try {
            let pt02d: Point2D = polygon[0];
            let ptLast2d: Point2D = polygon[(polygon.length - 1)];
            let pt0: POINT2 = new POINT2(pt02d.getX(), pt02d.getY());
            let ptLast: POINT2 = new POINT2(ptLast2d.getX(), ptLast2d.getY());
            let nearestPt: Point2D = new Point2D();
            let clipArray: Polygon = new Polygon();
            let j: int = 0;
            let minDist: double = Number.MAX_VALUE;
            let dist: double = 0;
            let sidePt: POINT2 = new POINT2();
            let addToFront: boolean = false;
            let addToEnd: boolean = false;
            //int n=clipBounds.length;
            //for(j=0;j<clipBounds.length;j++)
            for (j = 0; j < clipBounds.length; j++)    //was n
            {
                clipArray.addPoint(clipBounds[j].getX() as int, clipBounds[j].getY() as int);
            }

            let totalX: double = 0;
            let totalY: double = 0;
            let counter: int = 0;
            //for(j=0;j<clipBounds.length-1;j++)
            for (j = 0; j < clipBounds.length - 1; j++)  //was n-1
            {
                totalX += clipBounds[j].getX();
                totalY += clipBounds[j].getY();
                counter++;
            }
            //if clipBounds is not closed add the jth point
            if (clipBounds[0].getX() !== clipBounds[j].getX() ||
                clipBounds[0].getY() !== clipBounds[j].getY()) {
                totalX += clipBounds[j].getX();
                totalY += clipBounds[j].getY();
                counter++;
            }
            let avgX: double = totalX / counter;
            let avgY: double = totalY / counter;
            let ptCenter: POINT2 = new POINT2(avgX, avgY);
            let ptNear: POINT2;
            //first point outside the clip bounds
            if (clipArray.contains(pt02d) === false) {
                //add nearest segment midpoint to the front
                //for(j=0;j<clipBounds.length;j++)
                for (j = 0; j < clipBounds.length; j++)    //was n
                {
                    sidePt.x = clipBounds[j].getX();
                    sidePt.y = clipBounds[j].getY();
                    dist = lineutility.CalcDistanceDouble(pt0, sidePt);
                    if (dist < minDist) {
                        minDist = dist;
                        //minDistIndex=j;
                        nearestPt.setLocation(sidePt.x, sidePt.y);
                    }
                }
                //move nearestPt in a bit to not get clipped
                ptNear = new POINT2(nearestPt.getX(), nearestPt.getY());
                ptNear = lineutility.ExtendAlongLineDouble(ptNear, ptCenter, 2);
                nearestPt.setLocation(ptNear.x, ptNear.y);
                polygon.splice(0, 0, nearestPt);
                addToFront = true;
            }
            //re-initialize variables
            nearestPt = new Point2D();
            minDist = Number.MAX_VALUE;
            //last point outside the clip bounds
            if (clipArray.contains(ptLast2d) === false) {
                //add nearest segment midpoint to the front
                //for(j=0;j<clipBounds.length;j++)
                for (j = 0; j < clipBounds.length; j++)    //was n
                {
                    sidePt.x = clipBounds[j].getX();
                    sidePt.y = clipBounds[j].getY();
                    dist = lineutility.CalcDistanceDouble(ptLast, sidePt);
                    if (dist < minDist) {
                        minDist = dist;
                        //minDistIndex=j;
                        nearestPt.setLocation(sidePt.x, sidePt.y);
                    }
                }
                //move nearestPt in a bit to not get clipped
                ptNear = new POINT2(nearestPt.getX(), nearestPt.getY());
                ptNear = lineutility.ExtendAlongLineDouble(ptNear, ptCenter, 2);
                nearestPt.setLocation(ptNear.x, ptNear.y);
                polygon.push(nearestPt);
                addToEnd = true;
            }
            if (addToFront === false && addToEnd === false) {
                result = 0;
            }
            else {
                if (addToFront === true && addToEnd === false) {
                    result = 1;
                }
                else {
                    if (addToFront === false && addToEnd === true) {
                        result = 2;
                    }
                    else {
                        if (addToFront === true && addToEnd === true) {
                            result = 3;
                        }
                    }

                }

            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "AddBoundaryPointsForLines",
                    new RendererException("Failed inside AddBoundaryPointsForLines", exc));
            } else {
                throw exc;
            }
        }
        return result;
    }
    private static CalcTrueIntersectDouble(m1: double,
        b1: double,
        m2: double,
        b2: double,
        bolVertical1: int,
        bolVertical2: int,
        X1: double,	//x intercept if line1 is vertical
        X2: double): Point2D {
        let ptIntersect: Point2D = new Point2D(X1, X2);
        try {
            let x: double = 0;
            let y: double = 0;

            if (bolVertical1 === 0 && bolVertical2 === 0) {
                //both lines vertical
                return ptIntersect;
            }

            //the following 3 if blocks are the only ways to get an intersection
            if (bolVertical1 === 0 && bolVertical2 === 1)	//line1 vertical, line2 not
            {
                ptIntersect.setLocation(X1, m2 * X1 + b2);
                return ptIntersect;
            }
            if (bolVertical1 === 1 && bolVertical2 === 0)	//line2 vertical, line1 not
            {
                ptIntersect.setLocation(X2, m1 * X2 + b1);
                return ptIntersect;
            }
            //if either of the lines is vertical function has already returned
            //so both m1 and m2 should be valid
            //should always be using this ocase because the lines are neither vertical
            //or horizontal and are perpendicular
            if (m1 !== m2) {
                x = (b2 - b1) / (m1 - m2);	//cannot blow up
                y = (m1 * x + b1);
                ptIntersect.setLocation(x, y);
                return ptIntersect;
            }
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "CalcTrueIntersectDouble",
                    new RendererException("Failed inside CalcTrueIntersectDouble", exc));
            } else {
                throw exc;
            }
        }
        return ptIntersect;
    }
    /**
     * Gets theoretical intersection of an edge with the line connecting previous and current points.
     * @param previous
     * @param current
     * @param currentEdge the current edge of the clip area, assumed to not be vertical
     * @return 
     */
    private static intersectPoint2(previous: Point2D,
        current: Point2D,
        currentEdge: Line2D): Point2D {

        let ptIntersect: Point2D;
        try {
            let ll: Point2D = currentEdge.getP1();
            let ul: Point2D = currentEdge.getP2();

            //no vertical client segments
            //if(current.getX()==previous.getX())            
            if (Math.abs(current.getX() - previous.getX()) < 1) {

                current.setLocation(current.getX() + 1, current.getY());
            }


            let m1: double = (ul.getY() - ll.getY()) / (ul.getX() - ll.getX());
            let m2: double = (current.getY() - previous.getY()) / (current.getX() - previous.getX());
            let b1: double = ul.getY() - m1 * ul.getX();
            let b2: double = current.getY() - m2 * current.getX();
            ptIntersect = clsClipQuad.CalcTrueIntersectDouble(m1, b1, m2, b2, 1, 1, 0, 0);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "intersectPoint2",
                    new RendererException("Failed inside intersectPoint2", exc));
            } else {
                throw exc;
            }
        }
        return ptIntersect;
    }

    /**
     * clips array of pts against a side of the clip bounds polygon
     * assumes clipBounds has no vertical or horizontal segments 
     * @param pts array of points to clip against the clip bounds
     * @param index starting index of clipBounds for the side to clip against
     * @param clipBounds a quadrilateral or a polygon array that is the clipping area
     * @return the clipped array of points
     */
    private static clipSide(tg: TGLight, pts: Array<Point2D>,
        index: int,
        clipBounds: Array<Point2D>): Array<Point2D> {
        let ptsResult: Array<Point2D>;
        try {
            let pt1: Point2D = new Point2D(clipBounds[index].getX(), clipBounds[index].getY());//first point of clip side
            let pt2: Point2D = new Point2D(clipBounds[index + 1].getX(), clipBounds[index + 1].getY());//last point of clip side
            let clipBoundsPoint: Point2D;//some point in the clipbounds not on the side
            let ptClipBoundsIntersect: Point2D;//some point in the clipbounds not on the side
            let m1: double = 0;
            let m2: double = 0;
            let b1: double = 0;
            let b2: double = 0;
            let b3: double = 0;
            let b4: double = 0;
            let ptPreviousIntersect: Point2D;
            let ptCurrentIntersect: Point2D;
            let j: int = 0;
            let clipBoundsQuadrant: int = -1;
            let previousQuadrant: int = -1;
            let currentQuadrant: int = -1;  //quadrants relative to side
            let current: Point2D;
            let previous: Point2D;
            let intersectPt: Point2D;
            let edge: Line2D;
            ptsResult = new Array();
            //set some point in the array which is not in the side
            //this point will be used to define which side of the clipping side the rest of the clipbounds points are on
            //then it can be used to figure out whether a given point is to be clipped
            //for this scheme to work it needs to be a convex clipping area
            if (index === 0) {
                clipBoundsPoint = new Point2D(clipBounds[index + 2].getX(), clipBounds[index + 2].getY());
            }
            else {
                if (index > 1) {
                    clipBoundsPoint = new Point2D(clipBounds[index - 2].getX(), clipBounds[index - 2].getY());
                }
                else {
                    if (index === 1) {
                        clipBoundsPoint = new Point2D(clipBounds[0].getX(), clipBounds[0].getY());
                    }
                }

            }


            //no vertical segments
            //if(pt2.getX()==pt1.getX())
            if (Math.abs(pt2.getX() - pt1.getX()) < 1) {

                pt2.setLocation(pt2.getX() + 1, pt2.getY());
            }

            //if(pt2.getY()==pt1.getY())
            if (Math.abs(pt2.getY() - pt1.getY()) < 1) {

                pt2.setLocation(pt2.getX(), pt2.getY() + 1);
            }


            for (j = 0; j < pts.length; j++) {
                current = pts[j];
                if (j === 0) {
                    previous = pts[pts.length - 1];
                }
                else {
                    previous = pts[j - 1];
                }

                m1 = (pt2.getY() - pt1.getY()) / (pt2.getX() - pt1.getX());
                m2 = -1 / m1;  //the slope of the line perpendicular to m1,b1
                b1 = pt2.getY() - m1 * pt2.getX();
                b2 = previous.getY() - m2 * previous.getX();
                b3 = current.getY() - m2 * current.getX();
                b4 = clipBoundsPoint.getY() - m2 * clipBoundsPoint.getX();
                ptPreviousIntersect = clsClipQuad.CalcTrueIntersectDouble(m1, b1, m2, b2, 1, 1, 0, 0);
                ptCurrentIntersect = clsClipQuad.CalcTrueIntersectDouble(m1, b1, m2, b3, 1, 1, 0, 0);
                ptClipBoundsIntersect = clsClipQuad.CalcTrueIntersectDouble(m1, b1, m2, b4, 1, 1, 0, 0);
                clipBoundsQuadrant = lineutility.GetQuadrantDouble(clipBoundsPoint.getX(), clipBoundsPoint.getY(), ptClipBoundsIntersect.getX(), ptClipBoundsIntersect.getY());
                previousQuadrant = lineutility.GetQuadrantDouble(previous.getX(), previous.getY(), ptPreviousIntersect.getX(), ptPreviousIntersect.getY());
                currentQuadrant = lineutility.GetQuadrantDouble(current.getX(), current.getY(), ptCurrentIntersect.getX(), ptCurrentIntersect.getY());

                //case: both inside
                if (previousQuadrant === clipBoundsQuadrant && currentQuadrant === clipBoundsQuadrant) {

                    ptsResult.push(current);
                }

                else {
                    if (previousQuadrant === clipBoundsQuadrant && currentQuadrant !== clipBoundsQuadrant)//previous inside, current outside
                    {
                        edge = new Line2D(pt1, pt2);
                        intersectPt = clsClipQuad.intersectPoint2(previous, current, edge);
                        if (intersectPt != null) {
                            ptsResult.push(intersectPt);
                        }
                        tg.set_WasClipped(true);
                    }
                    else {
                        if (previousQuadrant !== clipBoundsQuadrant && currentQuadrant === clipBoundsQuadrant)//current inside, previous outside
                        {
                            edge = new Line2D(pt1, pt2);
                            intersectPt = clsClipQuad.intersectPoint2(previous, current, edge);
                            if (intersectPt != null) {
                                ptsResult.push(intersectPt);
                            }
                            ptsResult.push(current);
                            tg.set_WasClipped(true);
                        }
                        else {
                            if (previousQuadrant !== clipBoundsQuadrant && currentQuadrant !== clipBoundsQuadrant) {

                                continue;
                            }

                        }

                    }

                }

            }//end for j=0 to pts.length-1
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "clipSide",
                    new RendererException("Failed inside clipSide", exc));
            } else {
                throw exc;
            }
        }
        return ptsResult;
    }
    /**
     * for pre-clipped lines which also require fill but need the processed points
     * to create the fill. This function is called after the clip, so the fill
     * does not get clipped.
     * @param tg
     * @param shapes
     */
    protected static addAbatisFill(tg: TGLight,
        shapes: Array<Shape2>): void {
        try {
            if (tg.Pixels == null ||
                tg.Pixels.length < 2 ||
                tg.get_FillColor() == null ||
                tg.get_FillColor().getAlpha() < 2 ||
                shapes == null) {

                return;
            }


            let j: int = 0;
            let n: int = tg.Pixels.length;
            let shape: Shape2;
            let tg2: TGLight;
            switch (tg.get_LineType()) {
                case TacticalLines.MSDZ: {
                    let dist0: double = 0;
                    let dist1: double = 0;
                    let dist2: double = 0;
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setFillColor(tg.get_FillColor());
                    if (tg.Pixels != null && tg.Pixels.length >= 300) {
                        dist0 = Math.abs(tg.Pixels[0].x - tg.Pixels[50].x);
                        dist1 = Math.abs(tg.Pixels[100].x - tg.Pixels[150].x);
                        dist2 = Math.abs(tg.Pixels[200].x - tg.Pixels[250].x);
                        let start: int = -1;
                        let end: int = -1;
                        if (dist0 >= dist1 && dist0 >= dist2) {
                            start = 0;
                            end = 99;
                        }
                        else {
                            if (dist1 >= dist0 && dist1 >= dist2) {
                                start = 100;
                                end = 199;
                            }
                            else {
                                start = 200;
                                end = 299;
                            }
                        }

                        shape.moveTo(tg.Pixels[start]);
                        for (j = start; j <= end; j++) {

                            shape.lineTo(tg.Pixels[j]);
                        }


                        //shapes.add(0,shape);
                    }
                    break;
                }

                case TacticalLines.ABATIS: {
                    shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
                    shape.setFillColor(tg.get_FillColor());
                    tg2 = new TGLight();
                    tg2.set_LineType(TacticalLines.GENERAL);
                    tg2.Pixels = new Array();
                    if (tg.Pixels != null && tg.Pixels.length > 2) {
                        tg2.Pixels.push(tg.Pixels[n - 3]);
                        tg2.Pixels.push(tg.Pixels[n - 2]);
                        tg2.Pixels.push(tg.Pixels[n - 1]);
                        tg2.Pixels.push(tg.Pixels[n - 3]);

                        shape.moveTo(tg2.Pixels[0]);
                        for (j = 1; j < tg2.Pixels.length; j++) {

                            shape.lineTo(tg2.Pixels[j]);
                        }


                        //shapes.push(shape);
                    }
                    break;
                }

                default: {
                    return;
                }

            }//end switch
            if (shapes != null) {

                shapes.splice(0, 0, shape);
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "addAbatisFill",
                    new RendererException("Failed inside addAbatisFill", exc));
            } else {
                throw exc;
            }
        }
    }

    /**
     * for lines with glyphs the fill must be handled (clipped) as a separate shape.
     * this function needs to be called before the clipping is done to the line
     * @param tg
     * @param clipBounds
     * @return
     */
    static LinesWithFill(tg: TGLight,
        clipBounds: Array<Point2D>): Array<Shape2> | null {
        let shapes: Array<Shape2>;
        try {
            if (tg.get_FillColor() == null || tg.get_FillColor().getAlpha() <= 1 ||
                tg.Pixels == null || tg.Pixels.length === 0) {

                return shapes;
            }


            switch (tg.get_LineType()) {
                case TacticalLines.ABATIS:
                case TacticalLines.SPT:
                case TacticalLines.MAIN:
                case TacticalLines.AAAAA:
                case TacticalLines.AIRAOA:
                case TacticalLines.CATK:
                case TacticalLines.CATKBYFIRE:
                case TacticalLines.CORDONSEARCH:
                case TacticalLines.CORDONKNOCK:
                case TacticalLines.SECURE:
                case TacticalLines.OCCUPY:
                case TacticalLines.RETAIN:
                case TacticalLines.ISOLATE:
                case TacticalLines.CONVOY:
                case TacticalLines.HCONVOY: {
                    return shapes;
                }

                case TacticalLines.PAA_RECTANGULAR:
                case TacticalLines.RECTANGULAR_TARGET: {
                    return null;
                }

                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.STRONG:
                case TacticalLines.ZONE:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM: {
                    return clsClipQuad.fillDMA(tg, clipBounds);
                }

                default: {
                    break;
                }

            }
            if (clsUtility.LinesWithFill(tg.get_LineType()) === false) {

                return shapes;
            }


            shapes = new Array();
            //undo any fillcolor that might have been set for the existing shape
            //because we are divorcing fill from the line
            let shape: Shape2;

            //create a generic area tg from the pixels and clip it
            let tg2: TGLight = new TGLight();
            tg2.set_LineType(TacticalLines.GENERAL);
            tg2.Pixels = new Array();
            tg2.Pixels.push(...tg.Pixels);
            clsClipQuad.closeAreaTG(tg2);
            //tg2.Pixels.push(tg.Pixels[0]);
            if (clipBounds != null) {

                clsClipQuad.ClipPolygon(tg2, clipBounds);
            }



            if (tg2.Pixels == null || tg2.Pixels.length === 0) {

                return null;
            }


            let j: int = 0;
            shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            shape.setFillColor(tg.get_FillColor());

            shape.moveTo(tg2.Pixels[0]);
            for (j = 1; j < tg2.Pixels.length; j++) {

                shape.lineTo(tg2.Pixels[j]);
            }


            if (tg.get_FillColor() != null || tg.get_FillColor().getAlpha() > 1) {
                shapes.push(shape);
            }
            else {

                return null;
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "LinesWithFill",
                    new RendererException("Failed inside LinesWithFill", exc));
            } else {
                throw exc;
            }
        }
        return shapes;
    }
    /**
     * closes an area
     * @param tg
     */
    private static closeAreaTG(tg: TGLight): void {
        try {
            if (tg.Pixels == null || tg.Pixels.length === 0) {

                return;
            }


            let pt0: POINT2 = tg.Pixels[0];
            let ptn: POINT2 = tg.Pixels[tg.Pixels.length - 1];
            if (pt0.x !== ptn.x || pt0.y !== ptn.y) {

                tg.Pixels.push(pt0);
            }


        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "closeAreaTG",
                    new RendererException("Failed inside closeAreaTG", exc));
            } else {
                throw exc;
            }
        }
    }
    /**
     * DMA, DMAF fill must be handled separately because of the feint
     * @param tg
     * @param clipBounds
     * @return
     */
    protected static fillDMA(tg: TGLight,
        clipBounds: Array<Point2D>): Array<Shape2> {
        let shapes: Array<Shape2> = new Array();
        try {
            switch (tg.get_LineType()) {
                case TacticalLines.OBSFAREA:
                case TacticalLines.OBSAREA:
                case TacticalLines.STRONG:
                case TacticalLines.ZONE:
                case TacticalLines.FORT_REVD:
                case TacticalLines.FORT:
                case TacticalLines.ENCIRCLE:
                case TacticalLines.ATDITCHC:
                case TacticalLines.ATDITCHM: {
                    break;
                }

                default: {
                    return shapes;
                }

            }
            let shape: Shape2;

            //create a generic area tg from the pixels and clip it
            let j: int = 0;
            let tg2: TGLight = new TGLight();
            tg2.set_LineType(TacticalLines.GENERAL);
            tg2.Pixels = new Array();
            //to get the original pixels size
            let n: int = 0;
            n = tg.Pixels.length;

            for (j = 0; j < n; j++) {

                tg2.Pixels.push(tg.Pixels[j]);
            }


            clsClipQuad.closeAreaTG(tg2);

            if (clipBounds != null) {

                clsClipQuad.ClipPolygon(tg2, clipBounds);
            }


            if (tg2.Pixels == null || tg2.Pixels.length === 0) {

                return shapes;
            }


            shape = new Shape2(Shape2.SHAPE_TYPE_POLYLINE);
            shape.setFillColor(tg.get_FillColor());

            shape.moveTo(tg2.Pixels[0]);
            //original pixels do not include feint
            for (j = 1; j < tg2.Pixels.length; j++) {

                shape.lineTo(tg2.Pixels[j]);
            }


            shapes.push(shape);
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "fillDMA",
                    new RendererException("Failed inside fillDMA", exc));
            } else {
                throw exc;
            }
        }
        return shapes;
    }
    //    private static Boolean isClosed(ArrayList<POINT2>pts)
    //    {
    //        boolean closed=false;
    //        POINT2 pt0=pts[0];
    //        POINT2 ptLast=pts[pts.length-1];
    //        if(pt0.x==ptLast.x && pt0.y==ptLast.y)
    //            closed=true;
    //        return closed;
    //    }
    /**
     * 
     * @param tg
     * @param clipBounds polygon representing clipping area
     * @return 
     */
    static ClipPolygon(tg: TGLight,
        clipBounds: Array<Point2D>): Array<Point2D> {
        let poly: Array<Point2D> = new Array();
        try {
            //diagnostic
            let isClosed: boolean = clsUtility.isClosedPolygon(tg.get_LineType());
            //Boolean isClosed = isClosed(tg.Pixels);
            //M. Deutch commented one line 12-27-12
            //clipBounds=clsUtilityGE.expandPolygon(clipBounds, 20);
            clipBounds = clsUtilityGE.expandPolygon(clipBounds, 20);
            //int n=clipBounds.length;
            let polygon: Array<Point2D> = clsUtilityCPOF.POINT2toPoint2D(tg.Pixels);

            let j: int = 0;
            let hashMap: Map<string, Point2D> = new Map<string, Point2D>();
            //int hashCode=0;
            for (j = 0; j < polygon.length; j++) {

                hashMap.set(j.toString(), polygon[j]);
            }


            //close the clipbounds if necessary
            let clipBoundsPtStart: Point2D = clipBounds[0];
            let clipBoundsPtEnd: Point2D = clipBounds[clipBounds.length - 1];
            if (clipBoundsPtStart.getX() !== clipBoundsPtEnd.getX() ||
                clipBoundsPtStart.getY() !== clipBoundsPtEnd.getY()) {

                clipBounds.push(clipBoundsPtStart);
            }


            let addedLinePoints: int = 0;
            if (isClosed) {

                polygon.splice(polygon.length - 1, 1);
            }

            else {
                addedLinePoints = clsClipQuad.AddBoundaryPointsForLines(polygon, clipBounds);
            }

            //for(j=0;j<clipBounds.length-1;j++)
            for (j = 0; j < clipBounds.length - 1; j++) {
                if (j === 0) {

                    poly = clsClipQuad.clipSide(tg, polygon, j, clipBounds);
                }

                else {

                    poly = clsClipQuad.clipSide(tg, poly, j, clipBounds);
                }

            }


            if (isClosed) {
                if (poly.length > 0) {
                    poly.push(poly[0]);
                }
            }
            else {
                switch (addedLinePoints) {
                    case 0: { //no points were added, do nothing
                        break;
                    }

                    case 1: { //point was added to the front to make algorithm work, remove segment
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        break;
                    }

                    case 2: { //point was added to the end to make algorithm work, remove segment
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        break;
                    }

                    case 3: { //point was added to the front and end to make algorithm work, remove segments
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(0, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        if (poly.length > 0) {
                            poly.splice(poly.length - 1, 1);
                        }
                        break;
                    }


                    default:

                }
            }

            if (isClosed === true) {
                if (poly.length > 2) {
                    tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2Mapped(poly, hashMap);
                }
                else {
                    tg.Pixels = new Array();
                }

            }
            else {
                if (poly.length > 1) {
                    tg.Pixels = clsUtilityCPOF.Point2DtoPOINT2Mapped(poly, hashMap);
                }
                else {
                    tg.Pixels = new Array();
                }
            }

        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException(clsClipQuad._className, "ClipPolygon",
                    new RendererException("Failed inside ClipPolygon", exc));
            } else {
                throw exc;
            }
        }
        return poly;
    }
}
