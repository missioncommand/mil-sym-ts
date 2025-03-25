import { Rectangle } from "./rectangle";
import { ShapeTypes } from "./types";

export class Ellipse
{
    private rectangle:Rectangle

    constructor(x:number,y:number,w:number,h:number) 
    {
        this.rectangle = new Rectangle(x,y,w,h);
    }

    getShapeType():string
    {
        return ShapeTypes.ELLIPSE;
    }

    getBounds():Rectangle
    {
        return new Rectangle(this.rectangle.getX()-1,
                                this.rectangle.getY()-1,
                                this.rectangle.getWidth()+2,
                                this.rectangle.getHeight()+2);
    }

    shift(x:number,y:number){
        this.rectangle.shift(x,y);
    }

    setPath(context:CanvasRenderingContext2D){
        var x = this.rectangle.getX(),
            y = this.rectangle.getY(),
            w = this.rectangle.getWidth(),
            h = this.rectangle.getHeight();

        var kappa = 0.5522848,
            ox = (w/2)*kappa,//control point offset horizontal
            oy = (h/2)*kappa,//control point offset vertical
            xe = x + w,      //x-end
            ye = y + h,      //y-end
            xm = x + w / 2,  //x-middle
            ym = y + h / 2;  //y-middle

        //context.beginPath();
        context.moveTo(x,ym);
        context.bezierCurveTo(x,ym-oy,xm-ox,y,xm,y);
        context.bezierCurveTo(xm + ox,y,xe,ym - oy,xe,ym);
        context.bezierCurveTo(xe,ym+oy,xm+ox,ye,xm,ye);
        context.bezierCurveTo(xm-ox,ye,x,ym+oy,x,ym);
        context.closePath();
    }
    stroke(context:CanvasRenderingContext2D):void
    {
        context.beginPath();
        this.setPath(context);
        context.stroke();
    }
    fill(context:CanvasRenderingContext2D):void
    {
        context.beginPath();
        this.setPath(context);
        context.fill();
    }
    toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null):string
    {
        var cx = this.rectangle.getCenterX();
        var cy = this.rectangle.getCenterY();
        var rx = this.rectangle.getWidth()/2;
        var ry = this.rectangle.getHeight()/2;
        var line = '<ellipse cx="' + cx + '" cy="' + cy;
        line += '" rx="' + rx + '" ry="' + ry + '"';
        
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
    };

}


    