/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type int, type double } from "../graphics2d/BasicTypes";

import { AffineTransform } from "../graphics2d/AffineTransform"
import { Point2D } from "../graphics2d/Point2D"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"
import { Point } from "./Point";
import { RectUtilities } from "../renderer/utilities/RectUtilities";

/**
 *
 *
 */
export class Rectangle implements Shape {
    public static readonly OUT_LEFT = 1;
    public static readonly OUT_TOP = 2;
    public static readonly OUT_RIGHT = 4;
    public static readonly OUT_BOTTOM = 8;
    public x: int = 0;
    public y: int = 0;
    public width: int = 0;
    public height: int = 0;
    public constructor();
    public constructor(x1: int, y1: int, width1: int, height1: int);
    public constructor(...args: unknown[]) {
        
        switch (args.length) {
            case 0: {
                
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.height = 0;

                break;
            }

            case 4: {
                const [x1, y1, width1, height1] = args as [int, int, int, int];

                this.x = x1;
                this.y = y1;
                this.width = width1;
                this.height = height1;

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public getShapeType():string
    {
        return "RECTANGLE";
    }
    public getBounds(): Rectangle {
        return new Rectangle(Math.trunc(this.x),Math.trunc(this.y),Math.trunc(this.width),Math.trunc(this.height));
    }
    public getPathIterator(at: AffineTransform): null {
        return null;
    }
    public intersects(rect: Rectangle2D): boolean;
    public intersects(x1: double, y1: double, width1: double, height1: double): boolean;
    public intersects(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                const [rect] = args as [Rectangle2D];


                if (this.x + this.width < rect.x) {

                    return false;
                }

                if (this.x > rect.x + rect.width) {

                    return false;
                }

                if (this.y + this.height < rect.y) {

                    return false;
                }

                if (this.y > rect.y + rect.height) {

                    return false;
                }


                return true;


                break;
            }

            case 4: {
                const [x1, y1, width1, height1] = args as [double, double, double, double];


                if (this.x + this.width < x1) {

                    return false;
                }

                if (this.x > x1 + width1) {

                    return false;
                }

                if (this.y + this.height < y1) {

                    return false;
                }

                if (this.y > y1 + height1) {

                    return false;
                }


                return true;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public contains(pt: Point2D): boolean;
    public contains(x1: int, y1: int): boolean;
    public contains(x1: int, y1: int, width1: int, height1: int): boolean;
    public contains(...args: unknown[]): boolean {
        switch (args.length) {
            case 1: {
                const [pt] = args as [Point2D];


                if (this.x <= pt.getX() && pt.getX() <= this.x + this.width &&
                    this.y <= pt.getY() && pt.getY() <= this.y + this.height) {

                    return true;
                }

                else {
                    return false;
                }



                break;
            }

            case 2: {
                const [x1, y1] = args as [int, int];


                if (this.x <= x1 && x1 <= this.x + this.width &&
                    this.y <= y1 && y1 <= this.y + this.height) {

                    return true;
                }

                else {
                    return false;
                }



                break;
            }

            case 4: {
                const [x1, y1, width1, height1] = args as [int, int, int, int];


                if (this.contains(x1, y1) && this.contains(x1 + width1, y1 + height1)) {

                    return true;
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

    public getBounds2D(): Rectangle2D {
        return new Rectangle2D(this.x, this.y, this.width, this.height);
    }
    public getX(): double {
        return this.x;
    }
    public getY(): int {
        return this.y;
    }
    public getMinX(): int {
        return this.x;
    }
    public getMinY(): int {
        return this.y;
    }
    public getMaxX(): int {
        return this.x + this.width;
    }
    public getMaxY(): int {
        return this.y + this.height;
    }
    public getHeight(): int {
        return this.height;
    }
    public getWidth(): int {
        return this.width;
    }
    getBottom():number{
        return this.y + this.height;
    };

    getRight():number{
        return this.x + this.width;
    };

    getCenterX():number{
        return this.x + (this.width/2);
    };
    /**
     * 
     * @returns {Number}
     */
    getCenterY(){
        return this.y + (this.height/2);
    };
    
    public grow(h: int, v: int): void {
        this.x = this.x - h;
        this.y = this.y - v;
        this.width = this.width + (2*h);
        this.height = this.height + (2*v);
    }
    public setRect(rect: Rectangle): void {
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
    }
        /**
     * setLocation x,y (top,left) while maintaining the width and height.
     * @param x 
     * @param y 
     */
    public setLocation(x:number,y:number):void{
        this.x = x;
        this.y = y;
    };
    public isEmpty():boolean
    {
        return (this.width <= 0.0) || (this.height <= 0.0);
    };

    public shift(x:number,y:number):void
    {
        this.x += x;
        this.y += y;
        //height & width shouldn't change in a full shift of the rectangle.
        //this.height = this.bottom - this.y;
        //this.width = this.right - this.x;
    };
    /**
     * moves top,left points leaving bottom,right intact.
     * adjusts the height & width values as necessary
     * @param x 
     * @param y 
     */
    public shiftTL(x:number,y:number):void{
        let br:Point2D = new Point2D(this.x + this.width, this.y + this.height);

        this.x += x;
        this.y += y;

        this.height = br.getY() - this.y;
        this.width = br.getX() - this.x;
    };
    /**
     * moves bottom,right points leaving top,left intact.
     * adjusts the height & width values as necessary
     * @param {type} x the amount to move the right point by
     * @param {type} y the amount to move the bottom point by
     * @returns {_L7.Anonym$0.Rectangle.shiftTL}
     */
    public shiftBR(x:number,y:number):void{
        this.width += x;
        this.height += y;
        if(this.width < 0)
            this.width = 0;
        if(this.height < 0)
            this.height = 0;
    };

        /**
     * Will merge the bounds of two rectangle.
     * @param rect 
     */
        public union(rect:Rectangle)
        {
            let br1:Point2D = new Point2D(this.x + this.width, this.y + this.height);
            let br2:Point2D = new Point2D(rect.x + rect.width, rect.y + rect.height);
            if(rect)
            {
                if(rect.y < this.y)
                    this.y = rect.y;
                if(rect.x < this.x)
                    this.x = rect.x;
                if(br2.getY() > br1.getY())
                    this.height = br2.getY() - br1.getY();
                if(br2.getX() > br1.getX())
                    this.width = br2.getX() - br1.getX();
            }
                
        }
    
        public unionPoint(point:Point){
            if(point)
            {
                let tl:Point = new Point(this.x,this.y);
                let br:Point = new Point(this.x + this.width, this.y + this.height);

                if(point.y < tl.y)
                    tl.y = point.y;
                if(point.x < tl.x)
                    tl.x = point.x;
                if(point.y > br.y)
                    br.y = point.y;
                if(point.x > br.x)
                    br.x = point.x;
                this.x = tl.x;
                this.y = tl.y;
                this.width = br.x - this.x;
                this.height = br.y - this.y;
            }
                
        };

            /**
     * 
     * @param point 
     * @returns 
     */
    public containsPoint(point:Point):boolean
    {
        if(point)
        {
            var x = point.getX();
            var y = point.getY();
            var x0 = this.getX(),
                y0 = this.getY();
            return (x >= x0 &&
                y >= y0 &&
                x < x0 + this.getWidth() &&
                y < y0 + this.getHeight());
        }
        else
            return false;
    };
    
    public containsRectangle(rect:Rectangle):boolean
    {
        if(rect)
        {
            var x = rect.getX();
            var y = rect.getY();
            var w = rect.getWidth();
            var h = rect.getHeight();
            if (this.isEmpty() || w <= 0 || h <= 0) 
            {
                return false;
            }
            var x0 = this.getX(),
                y0 = this.getY();
            return (x >= x0 &&
                y >= y0 &&
                (x + w) <= x0 + this.getWidth() &&
                (y + h) <= y0 + this.getHeight());
        }
        else
            return false;
    };

        /**
     * Ported from Java
     */
    private outcode(x:number, y:number) 
    {
        var out = 0;
        if (this.width <= 0) {
        out |= Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT;
        } else if (x < this.x) {
        out |= Rectangle.OUT_LEFT;
        } else if (x > this.x + this.width) {
        out |= Rectangle.OUT_RIGHT;
        }
        if (this.height <= 0) {
        out |= Rectangle.OUT_TOP | Rectangle.OUT_BOTTOM;
        } else if (y < this.y) {
        out |= Rectangle.OUT_TOP;
        } else if (y > this.y + this.height) {
        out |= Rectangle.OUT_BOTTOM;
        }
        return out;
    };
    
    /**
    * Tests if the specified line segment intersects the interior of this
    * <code>Rectangle</code>. Ported from java.
    *
    * @param x1 the X coordinate of the start point of the specified
    *           line segment
    * @param y1 the Y coordinate of the start point of the specified
    *           line segment
    * @param x2 the X coordinate of the end point of the specified
    *           line segment
    * @param y2 the Y coordinate of the end point of the specified
    *           line segment
    * @return <code>true</code> if the specified line segment intersects
    * the interior of this <code>Rectangle</code>; <code>false</code>
    * otherwise.
    */
    public intersectsLine(x1: number, y1: number, x2: number, y2: number):boolean
    {
        let out1: number = 0;
        let out2: number = 0;
        if ((out2 = this.outcode(x2, y2)) === 0) {
            return true;
        }
        while ((out1 = this.outcode(x1, y1)) !== 0) {
            if ((out1 & out2) !== 0) {
                return false;
            }
            if ((out1 & (Rectangle.OUT_LEFT | Rectangle.OUT_RIGHT)) !== 0) {
                var x = this.getX();
                if ((out1 & Rectangle.OUT_RIGHT) !== 0) {
                    x += this.getWidth();
                }
                y1 = y1 + (x - x1) * (y2 - y1) / (x2 - x1);
                x1 = x;
            } else {
                var y = this.getY();
                if ((out1 & Rectangle.OUT_BOTTOM) !== 0) {
                    y += this.getHeight();
                }
                x1 = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
                y1 = y;
            }
        }
        return true;
    };

    // </editor-fold>

    public setPath(context:OffscreenCanvasRenderingContext2D)
    {
        var x = this.getX(),
            y = this.getY(),
            w = this.getWidth(),
            h = this.getHeight();
        
        //context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + w,y);
        context.lineTo(x + w,y + h);
        context.lineTo(x,y + h);
        context.closePath();
        
    };
    public stroke(context:OffscreenCanvasRenderingContext2D){
        context.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight());
    };
    public fill(context:OffscreenCanvasRenderingContext2D){
        context.fillRect(this.getX(),this.getY(),this.getWidth(),this.getHeight());
    };
    public clone():Rectangle{
        return new Rectangle(this.x,this.y,this.width,this.height);
    };
    
    /**
     * ported from java
     */
    /*intersects(r:Rectangle):boolean
    {
        if(r)
        {
            var tw = this.width;
            var th = this.height;
            var rw = r.width;
            var rh = r.height;
            if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
                return false;
            }
            var tx = this.x;
            var ty = this.y;
            var rx = r.x;
            var ry = r.y;
            rw += rx;
            rh += ry;
            tw += tx;
            th += ty;
            //      overflow || intersect
            return ((rw < rx || rw > tx) &&
                    (rh < ry || rh > ty) &&
                    (tw < tx || tw > rx) &&
                    (th < ty || th > ry));    
        }
        else
            return false;
        
    };//*/
    
    /**
     * 
     * @param stroke named color or value of rgb(#,#,#)
     * @param strokeWidth width of line in # of pixels
     * @param fill named color or value of rgb(#,#,#)
     * @returns 
     */
    public toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null):string
    {
        var line = '<rect x="' + this.x + '" y="' + this.y;
        line += '" width="' + this.width + '" height="' + this.height + '"';
        
        if(strokeWidth)
            line += ' stroke-width="' + strokeWidth + '"';
        else if(stroke) 
            line += ' stroke-width="2"';
        
        if(stroke)
            line += ' stroke="' + stroke + '"';
            
        if(fill)
            line += ' fill="' + fill + '"';
        else
            line += ' fill="none"';
        
        line += '/>';
        return line;
    }
    
}
