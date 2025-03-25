/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type int, type float, type double } from "../graphics2d/BasicTypes";

import { GeneralPath } from "../graphics2d/GeneralPath"
import { Polygon } from "../graphics2d/Polygon"
import { Shape } from "../graphics2d/Shape"
import { Stroke } from "../graphics2d/Stroke"


import { arraysupport } from "../JavaLineArray/arraysupport"
import { lineutility } from "../JavaLineArray/lineutility"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ref } from "../JavaLineArray/ref"
import { TacticalLines } from "../JavaLineArray/TacticalLines"




/**
 *
 *
 */
export class BasicStroke implements Stroke {

    /**
     * Joins path segments by extending their outside edges until they meet.
     */
    public static readonly JOIN_MITER: int = 0;
    /**
     * Joins path segments by rounding off the corner at a radius of half the
     * line width.
     */
    public static readonly JOIN_ROUND: int = 1;
    /**
     * Joins path segments by connecting the outer corners of their wide
     * outlines with a straight segment.
     */
    public static readonly JOIN_BEVEL: int = 2;
    /**
     * Ends unclosed subpaths and dash segments with no added decoration.
     */
    public static readonly CAP_BUTT: int = 0;
    /**
     * Ends unclosed subpaths and dash segments with a round decoration that has
     * a radius equal to half of the width of the pen.
     */
    public static readonly CAP_ROUND: int = 1;
    /**
     * Ends unclosed subpaths and dash segments with a square projection that
     * extends beyond the end of the segment to a distance equal to half of the
     * line width.
     */
    public static readonly CAP_SQUARE: int = 2;
    protected width: float;
    protected join: int = 0;
    protected cap: int = 0;
    protected miterlimit: float;
    protected dash: float[] | null;
    protected dash_phase: float;

    /**
     * Constructs a new <code>BasicStroke</code> with defaults for all
     * attributes. The default attributes are a solid line of width 1.0,
     * CAP_SQUARE, JOIN_MITER, a miter limit of 10.0.
     */
    public constructor();

    /**
     * Constructs a solid <code>BasicStroke</code> with the specified line width
     * and with default values for the cap and join styles.
     *
     * @param width
     * the width of the <code>BasicStroke</code>
     * @throws IllegalArgumentException
     * if <code>width</code> is negative
     */
    public constructor(width: float);

    public constructor(width: float, cap: int, join: int);

    public constructor(width: float, cap: int, join: int, miterlimit: float);

    public constructor(width: float, cap: int, join: int, miterlimit: float, dash: float[] | null, dash_phase: float);

    public constructor(width: float = 1.0, cap: int = BasicStroke.CAP_SQUARE, join: int = BasicStroke.JOIN_MITER, miterlimit: float = 10, dash: float[] | null = null, dash_phase: float = 0) {
        if (width < 0.0) {
            throw Error("negative width");
        }
        if (cap !== BasicStroke.CAP_BUTT && cap !== BasicStroke.CAP_ROUND && cap !== BasicStroke.CAP_SQUARE) {
            throw Error("illegal end cap value");
        }
        if (join === BasicStroke.JOIN_MITER) {
            if (miterlimit < 1.0) {
                throw Error("miter limit < 1");
            }
        } else {
            if (join !== BasicStroke.JOIN_ROUND && join !== BasicStroke.JOIN_BEVEL) {
                throw Error("illegal line join value");
            }
        }

        if (dash != null) {
            if (dash_phase < 0.0) {
                throw Error("negative dash phase");
            }
            let allzero: boolean = true;
            let n: int = 0;
            if (dash != null)
                n = dash.length;
            //for (int i = 0; i < dash.length; i++) 
            for (let i: int = 0; i < n; i++) {
                let d: float = dash[i];
                if (d > 0.0) {
                    allzero = false;
                } else {
                    if (d < 0.0) {
                        throw Error("negative dash length");
                    }
                }

            }
            if (allzero) {
                throw Error("dash lengths all zero");
            }
        }
        this.width = width;
        this.cap = cap;
        this.join = join;
        this.miterlimit = miterlimit;
        if (dash != null) {
            //this.dash = dash.clone() as number[];
            this.dash = dash.map((x) => x);//clones an array; https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
        }
        this.dash_phase = dash_phase;
    }


    /**
     * Returns a <code>Shape</code> whose interior defines the stroked outline
     * of a specified <code>Shape</code>.
     *
     * @param s
     * the <code>Shape</code> boundary be stroked
     * @return the <code>Shape</code> of the stroked outline.
     */
    public createStrokedShape(poly: Polygon): Shape {
        let pts: Array<POINT2> = poly.getPathIterator(null).getPoints();
        let j: int = 0;
        let gp: GeneralPath = new GeneralPath();
        let pt: POINT2;
        let ptsx: POINT2[] = new Array<POINT2>(pts.length);
        let n: int = pts.length;
        //for(j=0;j<pts.length;j++)
        for (j = 0; j < n; j++) {
            pt = pts[j];
            ptsx[j] = pt;
        }

        pts = BasicStroke.GetInteriorPoints(ptsx, pts.length, TacticalLines.DEPTH_AREA, this.width);


        //for(j=0;j<pts.length;j++)
        for (j = 0; j < n; j++) {
            pt = pts[j];
            if (j === 0) {

                gp.moveTo(pt.x, pt.y);
            }

            else {

                gp.lineTo(pt.x, pt.y);
            }

        }
        return gp;
    }


    public getLineWidth(): float {
        return this.width;
    }

    /**
     * Returns the end cap style.
     *
     * @return the end cap style of this <code>BasicStroke</code> as one of the
     * static <code>int</code> values that define possible end cap
     * styles.
     */
    public getEndCap(): int {
        return this.cap;
    }

    public getLineJoin(): int {
        return this.join;
    }

    /**
     * Returns the limit of miter joins.
     *
     * @return the limit of miter joins of the <code>BasicStroke</code>.
     */
    public getMiterLimit(): float {
        return this.miterlimit;
    }

    /**
     * Returns the array representing the lengths of the dash segments.
     * Alternate entries in the array represent the user space lengths of the
     * opaque and transparent segments of the dashes. As the pen moves along the
     * outline of the <code>Shape</code> to be stroked, the user space distance
     * that the pen travels is accumulated. The distance value is used to index
     * into the dash array. The pen is opaque when its current cumulative
     * distance maps to an even element of the dash array and transparent
     * otherwise.
     *
     * @return the dash array.
     */
    public getDashArray(): number[] | null {
        if (this.dash == null) {
            return null;
        }
        return this.dash.map((x) => x);//this.dash.clone() as number[];
    }

    public getDashPhase(): float {
        return this.dash_phase;
    }

    /**
     * Returns the hashcode for this stroke.
     *
     * @return a hash code for this stroke.
     */
    public hashCode(): int {
        let hash: int = (this.width);
        hash = hash * 31 + this.join;
        hash = hash * 31 + this.cap;
        hash = hash * 31 + (this.miterlimit);
        if (this.dash != null) {
            hash = hash * 31 + (this.dash_phase);
            let n: int = this.dash.length;
            //for (int i = 0; i < dash.length; i++) 
            for (let i: int = 0; i < n; i++) {
                hash = hash * 31 + (this.dash[i]);
            }
        }
        return hash;
    }

    public static GetInteriorPoints(pLinePoints: POINT2[],
        vblCounter: int,
        lineType: int,
        dist: double): Array<POINT2> {
        //var j:int=0;
        let j: int = 0;
        //var index:int=-1;
        let index: int = -1;
        //var pt0:POINT2,pt1:POINT2,pt2:POINT2;
        let pt0: POINT2;
        let pt1: POINT2;
        let pt2: POINT2;
        ///var m01:refobj=new refobj(),m12:refobj=new refobj();	//slopes for lines pt0-pt1 and pt1-pt2
        let m01: ref<number[]> = new ref();
        let m12: ref<number[]> = new ref();
        let m1: ref<number[]> = new ref();
        let m2: ref<number[]> = new ref();
        //var direction:int=-1;
        let direction: int = -1;
        //var array:Array=new Array();
        //ArrayList<POINT2>array=new ArrayList();
        //var intersectPt:POINT2=null;
        let intersectPt: POINT2;
        //var m1:refobj=new refobj(),m2:refobj=new refobj();
        //var intersectPoints:Array=new Array();
        let intersectPoints: Array<POINT2> = new Array();
        //var b01:Number,b12:Number;	//the y intercepts for the lines corresponding to m1,m2 
        let b01: double = 0;
        let b12: double = 0;
        //var dist:Number=10;
        //double dist = 10;
        //the first set of interior points
        //this assumes the area is closed
        for (j = 0; j < vblCounter; j++) {

            if (j === 0 || j === vblCounter - 1) {
                //pt0=new POINT2(pLinePoints[vblCounter-2]);
                //pt1=new POINT2(pLinePoints[0]);
                //pt2=new POINT2(pLinePoints[1]);
                pt0 = pLinePoints[vblCounter - 2];
                pt1 = pLinePoints[0];
                pt2 = pLinePoints[1];
            } else {
                //pt0=new POINT2(pLinePoints[j-1]);
                //pt1=new POINT2(pLinePoints[j]);
                //pt2=new POINT2(pLinePoints[j+1]);					
                pt0 = pLinePoints[j - 1];
                pt1 = pLinePoints[j];
                pt2 = pLinePoints[j + 1];
            }

            //the interiior points
            //var pt00:POINT2,pt01:POINT2;
            //var pt10:POINT2,pt11:POINT2;
            let pt00: POINT2;
            let pt01: POINT2;
            let pt10: POINT2;
            let pt11: POINT2;

            index = j - 1;
            if (index < 0) {
                index = vblCounter - 1;
            }

            direction = arraysupport.GetInsideOutsideDouble2(pt0, pt1, pLinePoints, vblCounter, index, lineType);
            //reverse the directions	 since these are interior points
            //pt00-pt01 will be the interior line inside line pt0-pt1
            //pt00 is inside pt0, pt01 is inside pt1
            switch (direction) {
                case 0: {
                    //direction=1;
                    pt00 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 1, dist);
                    pt01 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 1, dist);
                    break;
                }

                case 1: {
                    //direction=0;
                    pt00 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 0, dist);
                    pt01 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 0, dist);
                    break;
                }

                case 2: {
                    //direction=3;
                    pt00 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 3, dist);
                    pt01 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 3, dist);
                    break;
                }

                case 3: {
                    //direction=2;
                    pt00 = lineutility.ExtendDirectedLine(pt0, pt1, pt0, 2, dist);
                    pt01 = lineutility.ExtendDirectedLine(pt0, pt1, pt1, 2, dist);
                    break;
                }


                default:

            }

            //pt10-pt11 will be the interior line inside line pt1-pt2
            //pt10 is inside pt1, pt11 is inside pt2
            index = j;
            if (j === vblCounter - 1) {
                index = 0;
            }
            direction = arraysupport.GetInsideOutsideDouble2(pt1, pt2, pLinePoints, vblCounter, index, lineType);
            //reverse the directions	 since these are interior points
            switch (direction) {
                case 0: {
                    //direction=1;
                    pt10 = lineutility.ExtendDirectedLine(pt1, pt2, pt1, 1, dist);
                    pt11 = lineutility.ExtendDirectedLine(pt1, pt2, pt2, 1, dist);
                    break;
                }

                case 1: {
                    //direction=0;
                    pt10 = lineutility.ExtendDirectedLine(pt1, pt2, pt1, 0, dist);
                    pt11 = lineutility.ExtendDirectedLine(pt1, pt2, pt2, 0, dist);
                    break;
                }

                case 2: {
                    //direction=3;
                    pt10 = lineutility.ExtendDirectedLine(pt1, pt2, pt1, 3, dist);
                    pt11 = lineutility.ExtendDirectedLine(pt1, pt2, pt2, 3, dist);
                    break;
                }

                case 3: {
                    //direction=2;
                    pt10 = lineutility.ExtendDirectedLine(pt1, pt2, pt1, 2, dist);
                    pt11 = lineutility.ExtendDirectedLine(pt1, pt2, pt2, 2, dist);
                    break;
                }


                default:

            }	//end switch
            //intersectPt=new POINT2(null);
            //get the intersection of pt01-p00 and pt10-pt11
            //so it it is the interior intersection of pt0-pt1 and pt1-pt2

            //first handle the case of vertical lines.
            if (pt0.x === pt1.x && pt1.x === pt2.x) {
                intersectPt = new POINT2(pt01);
                intersectPoints.push(intersectPt);
                continue;
            }
            //it's the same situation if the slopes are identical,
            //simply use pt01 or pt10 since they already uniquely define the intesection
            lineutility.CalcTrueSlopeDouble2(pt00, pt01, m01);
            lineutility.CalcTrueSlopeDouble2(pt10, pt11, m12);
            if (m01.value[0] === m12.value[0]) {
                intersectPt = new POINT2(pt01);
                intersectPoints.push(intersectPt);
                continue;
            }
            //now we are assuming a non-trivial intersection
            //calculate the y-intercepts using y=mx+b (use b=y-mx)
            b01 = pt01.y - m01.value[0] * pt01.x;
            b12 = pt11.y - m12.value[0] * pt11.x;

            intersectPt = lineutility.CalcTrueIntersectDouble2(m01.value[0], b01, m12.value[0], b12, 1, 1, 0, 0);
            intersectPoints.push(intersectPt);
        }//end for
        return intersectPoints;
    }
}
