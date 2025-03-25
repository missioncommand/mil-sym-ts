/*
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/**
 * @author Denis M. Kishenko
 * @version $Revision$
 */
//THIS CLASS MODIFIED TO WORK ON JAVASCRIPT



import { type int, type double, type float } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { PathIterator } from "../graphics2d/PathIterator"
import { Point } from "../graphics2d/Point"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle } from "../graphics2d/Rectangle"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Path } from "../../../android/graphics/Path";
import { RectF } from "../../../android/graphics/RectF";


/**
 *
 *
 */
export class Polygon {

    /**
     * The points buffer capacity
     */
    private static BUFFER_CAPACITY:int = 4;

    public npoints: int = 0;

    public xpoints: int[];

    public ypoints: int[];

    protected bounds: Rectangle;

    
    public constructor();

    /**
     * 
     * @param xpoints 
     * @param ypoints 
     * @param npoints 
     */
    public constructor(xpoints: int[], ypoints: int[], npoints: int);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {

                this.xpoints = [];
                this.ypoints = [];

                break;
            }

            case 3: {
                const [xpoints, ypoints, npoints] = args as [int[], int[], int];

                // awt.111=Parameter npoints is greater than array length
                if (npoints > xpoints.length || npoints > ypoints.length) {
                    throw Error("Parameter npoints is greater than array length");
                }
                // awt.112=Negative number of points
                if (npoints < 0) {
                    throw Error("Negative number of points");
                }

                this.npoints = npoints;
                this.xpoints = this.copyOf(xpoints, npoints);
                this.ypoints = this.copyOf(ypoints, npoints);

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    private copyOf<T>(original:Array<T>, length): Array<T>
    {
        let arr:Array<T> = [];

        try
        {
            for(let i:number = 0; i < length; i++)
            {
                //should just be copying integer arrays so this simple copy should be fine.
                arr.push(original.at(i));
            }
        }
        catch(e)
        {
            throw new Error("Polygon.copyOf - " + e.message);
        }
        return arr;
    }

    public reset(): void {
        this.npoints = 0;
        this.bounds = null;
    }

    public invalidate(): void {
        this.bounds = null;
    }

    public addPoint(px: int, py: int): void 
    {
        this.xpoints.push(px);
        this.ypoints.push(py);
        this.npoints++;
        if (this.bounds != null) 
        {
            let temp:Rectangle = new Rectangle( Math.min(this.bounds.getMinX(), px),
                    Math.min(this.bounds.getMinY(), py),
                    Math.max(this.bounds.getMaxX() - this.bounds.getMinX(), px - this.bounds.getMinX()),
                    Math.max(this.bounds.getMaxY() - this.bounds.getMinY(), py - this.bounds.getMinY()));

                    this.bounds.setRect(temp);
        }
    }


    public getBounds(): Rectangle {
        if (this.bounds != null) {
            return this.bounds;
        }
        if (this.npoints == 0) {
            return new Rectangle();
        }

        let bx1:int = this.xpoints[0];
        let by1:int = this.ypoints[0];
        let bx2:int = bx1;
        let by2:int = by1;

        for (let i:int = 1; i < this.npoints; i++) {
            let x:int = this.xpoints[i];
            let y:int = this.ypoints[i];
            if (x < bx1) {
                bx1 = x;
            } else if (x > bx2) {
                bx2 = x;
            }
            if (y < by1) {
                by1 = y;
            } else if (y > by2) {
                by2 = y;
            }
        }

        return this.bounds = new Rectangle(bx1, by1, bx2 - bx1, by2 - by1);     
    }

    public getBoundingBox(): Rectangle {
        return this.getBounds();
    }

    
    public contains(p: Point | Point2D): boolean;
    public contains(r: Rectangle2D): boolean;
    public contains(x: double, y: double): boolean;
    public contains(x: double, y: double, w: double, h: double): boolean;
    public contains(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                if (args[0] instanceof Rectangle2D) {
                    const [r] = args as [Rectangle2D];
                    return this.contains(r.getX(), r.getY(), r.getWidth(), r.getHeight());
                } else if (args[0] instanceof Point || args[0] instanceof Point2D) {
                    const [p] = args as [Point | Point2D];
                    return this.contains(p.getX(), p.getY());
                } else {
                    throw "Invalid argument type"
                }
            }

            case 2: {
                const [x, y] = args as [double, double];


                if (this.npoints <= 2 || !this.getBoundingBox().contains(x as int, y as int)) {
                    return false;
                }
                let hits: int = 0;

                let lastx: int = this.xpoints[this.npoints - 1];
                let lasty: int = this.ypoints[this.npoints - 1];
                let curx: int = 0;
                let cury: int = 0;

                for (let i: int = 0; i < this.npoints; lastx = curx, lasty = cury, i++) {
                    curx = this.xpoints[i];
                    cury = this.ypoints[i];

                    if (cury === lasty) {
                        continue;
                    }

                    let leftx: int = 0;
                    if (curx < lastx) {
                        if (x >= lastx) {
                            continue;
                        }
                        leftx = curx;
                    } else {
                        if (x >= curx) {
                            continue;
                        }
                        leftx = lastx;
                    }

                    let test1: double = 0;
                    let test2: double = 0;
                    if (cury < lasty) {
                        if (y < cury || y >= lasty) {
                            continue;
                        }
                        if (x < leftx) {
                            hits++;
                            continue;
                        }
                        test1 = x - curx;
                        test2 = y - cury;
                    } else {
                        if (y < lasty || y >= cury) {
                            continue;
                        }
                        if (x < leftx) {
                            hits++;
                            continue;
                        }
                        test1 = x - lastx;
                        test2 = y - lasty;
                    }

                    if (test1 < (test2 / (lasty - cury) * (lastx - curx))) {
                        hits++;
                    }
                }

                return ((hits & 1) !== 0);
            }

            case 4: {
                const [x, y, w, h] = args as [double, double, double, double];


                if (this.npoints <= 0 || !this.getBoundingBox().intersects(x, y, w, h)) {
                    return false;
                }

                return false;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }
    


    public getBounds2D(): null {
        //return getBounds();
        return null;
    }


    public intersects(r: Rectangle2D): boolean;

    public intersects(x: double, y: double, w: double, h: double): boolean;
    public intersects(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                const [r] = args as [Rectangle2D];


                return this.intersects(r.getX(), r.getY(), r.getWidth(), r.getHeight());


                break;
            }

            case 4: {
                const [x, y, w, h] = args as [double, double, double, double];


                if (this.npoints <= 0 || !this.getBoundingBox().intersects(x, y, w, h)) {
                    return false;
                }

                if (this.bounds != null) {
                    let fx: float = x as float;
                    let fy: float = y as float;
                    let fw: float = w as float;
                    let fh: float = h as float;
                    //not sure if math is correct here
                    let that: Path = new Path();
                    //start
                    that.moveTo(fx, fy);
                    //go right
                    that.lineTo(fx + fw, fy);
                    //go down
                    that.lineTo(fx + fw, fy - fh);
                    //go left
                    that.lineTo(fx, fy - fh);
                    //close
                    that.close();
                    //bounds holder
                    let thatBounds: RectF = new RectF();
                    let rectf: RectF = new RectF(this.bounds.x as float, this.bounds.y as float, this.bounds.x as float + this.bounds.width as float, this.bounds.y as float + this.bounds.height as float);
                    return RectF.intersects(rectf, thatBounds);
                }
                else {
                    return false;
                }


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }



    public getPathIterator(at: AffineTransform | null): PathIterator;
    public getPathIterator(at: AffineTransform, flatness: double): PathIterator;
    public getPathIterator(...args: unknown[]): PathIterator {
        switch (args.length) {
            case 1: {
                const [at] = args as [AffineTransform];


                let pi: PathIterator = new PathIterator(null);
                let j: int = 0;
                if (this.npoints > 0) {
                    pi.moveTo(this.xpoints[0], this.ypoints[0]);
                    for (j = 1; j < this.npoints; j++) {
                        pi.lineTo(this.xpoints[j], this.ypoints[j]);
                    }
                }
                pi.reset();
                return pi;


                break;
            }

            case 2: {
                const [at, flatness] = args as [AffineTransform, double];


                return this.getPathIterator(at);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }
}
