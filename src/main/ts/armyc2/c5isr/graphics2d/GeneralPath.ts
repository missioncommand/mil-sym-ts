/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type double, type float, type int } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { IPathIterator } from "../graphics2d/IPathIterator"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"

import { POINT2 } from "../JavaLineArray/POINT2"

import { Path } from "../../../android/graphics/Path"
import { RectF } from "../../../android/graphics/RectF"


/**
 *
 *
 */
export class GeneralPath implements Shape {
    private _path: Path;
    private _pathIterator: PathIterator;
    public constructor() {
        
        this._path = new Path();
        this._pathIterator = new PathIterator(null);
    }
    public lineTo(x: double, y: double): void {
        this._path.lineTo(x as float, y as float);
        this._pathIterator.lineTo(x, y);
    }
    public moveTo(x: double, y: double): void {
        this._path.moveTo(x as float, y as float);
        this._pathIterator.moveTo(x, y);
    }
    public quadTo(x1: double, y1: double, x2: double, y2: double): void {
        this._path.quadTo(x1 as float, y1 as float, x2 as float, y2 as float);
        this._pathIterator.quadTo(x1, y1, x2, y2);
    }
    public cubicTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double): void {
        this._path.cubicTo(x1 as float, y1 as float, x2 as float, y2 as float, x3 as float, y3 as float);
        this._pathIterator.cubicTo(x1, y1, x2, y2, x3, y3);
    }
    public curveTo(x1: double, y1: double, x2: double, y2: double, x3: double, y3: double): void {
        this._path.cubicTo(x1 as float, y1 as float, x2 as float, y2 as float, x3 as float, y3 as float);
        this._pathIterator.cubicTo(x1, y1, x2, y2, x3, y3);
    }
    public computeBounds(rect: Rectangle2D): void {
        var rectf = new RectF();
        this._path.computeBounds(rectf, true);
        rect.x = rectf.left;
        rect.y = rectf.top;
        rect.width = rectf.bottom - rectf.top;
        rect.setRect(rectf.left, rectf.top, rectf.width(), rectf.height());
    }
    public closePath(): void {
        if (this._path != null) {

            this._path.close();
        }

    }
    public contains(pt: Point2D): boolean;

    public contains(r: Rectangle2D): boolean;
    public contains(x: int, y: int): boolean;
    public contains(x: int, y: int, width: int, height: int): boolean;
    public contains(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                if (args[0] instanceof Point2D) {
                    return false;
                } else {
                    const [r] = args as [Rectangle2D];
                    let rect: Rectangle = new Rectangle(r.x as int, r.y as int, r.width as int, r.height as int);
                    let rect2: Rectangle = this.getBounds();
                    return rect2.contains(rect.x, rect.y, rect.width, rect.height);
                }
            }

            case 2: {
                const [x, y] = args as [int, int];


                return false;


                break;
            }

            case 4: {
                const [x, y, width, height] = args as [int, int, int, int];


                let rect2: Rectangle = this.getBounds();
                return rect2.contains(x, y, width, height);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public getBounds2D(): Rectangle2D {
        return this._pathIterator.getBounds();
    }
    public getBounds(): Rectangle {
        let rect: Rectangle2D = this._pathIterator.getBounds();
        return new Rectangle(rect.x as int, rect.y as int, rect.width as int, rect.height as int);
    }
    /**
     * called only when the GeneralPath is a rectangle
     * @param rect
     * @return 
     */
    public intersects(rect: Rectangle2D): boolean;
    /**
     * Only tests against the bounds, used only when the GeneralPath is a rectangle
     * @param x
     * @param y
     * @param w
     * @param h
     * @return 
     */
    public intersects(x: double, y: double, w: double, h: double): boolean;
    public intersects(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                const [rect] = args as [Rectangle2D];


                return this.getBounds().intersects(rect.x, rect.y, rect.width, rect.height);


                break;
            }

            case 4: {
                const [x, y, w, h] = args as [double, double, double, double];


                return this.getBounds().intersects(x, y, w, h);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public append(shape: Shape, connect: boolean): void {
        let gp: GeneralPath = shape as GeneralPath;
        let pts: Array<POINT2> = gp._pathIterator.getPoints();
        let j: int = 0;
        let pt: POINT2;
        let pt1: POINT2;
        let pt2: POINT2;
        let n: int = pts.length;
        //for(j=0;j<pts.length;j++)
        for (j = 0; j < n; j++) {
            pt = pts[j];
            switch (pt.style) {
                case IPathIterator.SEG_MOVETO: {
                    this._path.moveTo(pt.x as float, pt.y as float);
                    this._pathIterator.moveTo(pt.x, pt.y);
                    break;
                }

                case IPathIterator.SEG_LINETO: {
                    this._path.lineTo(pt.x as float, pt.y as float);
                    this._pathIterator.lineTo(pt.x, pt.y);
                    break;
                }

                case IPathIterator.SEG_CUBICTO: {
                    pt1 = pts[j + 1]; j++;
                    pt2 = pts[j + 2]; j++;
                    this._path.cubicTo(pt.x as float, pt.y as float, pt1.x as float, pt1.y as float, pt2.x as float, pt2.y as float);
                    this._pathIterator.cubicTo(pt.x as float, pt.y as float, pt1.x as float, pt1.y as float, pt2.x as float, pt2.y as float);
                    break;
                }

                default: {
                    break;
                }

            }
        }
    }
    public getPath(): Path {
        return this._path;
    }
    public getPathIterator(tx: AffineTransform | null): PathIterator {
        this._pathIterator.reset();
        return this._pathIterator;
    }
}
