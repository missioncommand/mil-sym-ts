import { Rectangle2D } from "../../graphics2d/Rectangle2D";
import { Point } from "./point";
import { ShapeTypes } from "./types";

export class Rectangle
{

    private x:number;
    private y:number;
    private width:number;
    private height:number;
    private bottom:number;
    private right:number;

    public static readonly OUT_LEFT = 1;
    public static readonly OUT_TOP = 2;
    public static readonly OUT_RIGHT = 4;
    public static readonly OUT_BOTTOM = 8;

    constructor(x:number,y:number,width:number,height:number) 
    {
        this.x = x,
        this.y = y,
        this.width = width,
        this.height = height,
        this.bottom = y + height,
        this.right = x + width;
    }      
    // <editor-fold defaultstate="collapsed" desc="Public Property Functions">

    public getShapeType():string
    {
        return ShapeTypes.RECTANGLE;
    }
    
    public getBounds():Rectangle
    {
        return new Rectangle(this.x-1,
                                this.y-1,
                                this.width+2,
                                this.height+2);
    };

    public toRectangle2D():Rectangle2D
    {
        return new Rectangle2D(this.x,
            this.y,
            this.width,
            this.height);
    }

    public getX():number
    {
        return this.x;
    };

    public getY():number{
        return this.y;
    };

    public getWidth():number{
        return this.width;
    };

    public getHeight():number{
        return this.height;
    };

    public getBottom():number{
        return this.bottom;
    };

    public getRight():number{
        return this.right;
    };

    public getCenterX():number{
        return this.x + (this.width/2);
    };
    /**
     * 
     * @returns {Number}
     */
    public getCenterY(){
        return this.y + (this.height/2);
    };

    /**
     * setLocation x,y (top,left) while maintaining the width and height.
     * @param x 
     * @param y 
     */
    public setLocation(x:number,y:number):void{
        this.x = x;
        this.y = y;
        this.bottom = y + this.height;
        this.right = x + this.width;
    };
    
    public isEmpty():boolean
    {
        return (this.width <= 0.0) || (this.height <= 0.0);
    };
    
    // </editor-fold>
    
    // <editor-fold defaultstate="collapsed" desc="Public Utility Functions">
    
    public shift(x:number,y:number):void
    {
        this.x += x;
        this.y += y;
        this.right += x;
        this.bottom +=y;
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
        this.x += x;
        this.y += y;
        this.height = this.bottom - this.y;
        this.width = this.right - this.x;
    };
    /**
     * moves bottom,right points leaving top,left intact.
     * adjusts the height & width values as necessary
     * @param {type} x the amount to move the right point by
     * @param {type} y the amount to move the bottom point by
     * @returns {_L7.Anonym$0.Rectangle.shiftTL}
     */
    public shiftBR(x:number,y:number):void{
        this.right += x;
        this.bottom += y;
        this.height = this.bottom - this.y;
        this.width = this.right - this.x;
    };

    /**
     * Grow the rectangle by this many pixels in every direction
     * @param pixel 
     */
    public grow (pixel:number){
        this.shiftTL(-pixel,-pixel);
        this.shiftBR(pixel,pixel);
    };

    /**
     * Will merge the bounds of two rectangle.
     * @param rect 
     */
    public union(rect:Rectangle){
        if(rect)
        {
            if(rect.y < this.y)
                this.y = rect.y;
            if(rect.x < this.x)
                this.x = rect.x;
            if(rect.bottom > this.bottom)
                this.bottom = rect.bottom;
            if(rect.right > this.right)
                this.right = rect.right;
            this.width = this.right - this.x;
            this.height = this.bottom - this.y;
        }
            
    }

    public unionPoint(point:Point){
        if(point)
        {
            if(point.y < this.y)
                this.y = point.y;
            if(point.x < this.x)
                this.x = point.x;
            if(point.y > this.bottom)
                this.bottom = point.y;
            if(point.x > this.right)
                this.right = point.x;
            this.width = this.right - this.x;
            this.height = this.bottom - this.y;
        }
            
    };

    /**
     * if 2 values passed in, they are assumed to be the x,y of a point.
     * if 4 values passed in, they are assumed to be the x,y,w,h values
     * of a Rectangle.
     * @param x 
     * @param y 
     * @param w 
     * @param h 
     * @returns 
     */
    public contains(x:number,y:number,w?:number,h?:number)
    {
        if(x && y && w && h)
        {
            if (this.isEmpty() || w <= 0 || h <= 0) {
                return false;
            }
            var x0 = this.getX(),
                y0 = this.getY();
            return (x >= x0 &&
                    y >= y0 &&
                    (x + w) <= x0 + this.getWidth() &&
                    (y + h) <= y0 + this.getHeight());
        }
        else if(x && y)
        {
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
    public intersects(r:Rectangle):boolean
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