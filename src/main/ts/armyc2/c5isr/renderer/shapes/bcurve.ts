import { Point } from "./point";
import { Rectangle } from "./rectangle";

export class BCurve
{

    private x1 = 0;
    private y1 = 0;
    private x2 = 0;
    private y2 = 0;
    private x3 = 0;
    private y3 = 0;
    private x4 = 0;
    private y4 = 0;
    private rectangle:Rectangle;

    constructor(x1,y1,x2,y2,x3,y3,x4,y4) 
    {

    //will be larger than the actual curve.
    this.rectangle = new Rectangle(x1,y1,1,1);
    this.rectangle.unionPoint(new Point(x2,y2));
    this.rectangle.unionPoint(new Point(x3,y3));
    this.rectangle.unionPoint(new Point(x4,y4));

    };
	
    getShapeType():string
    {
        return "BCURVE";//armyc2.c2sd.renderer.so.ShapeTypes.BCURVE;
    }

    getBounds():Rectangle{
        return new Rectangle(this.rectangle.getX()-1,
                                this.rectangle.getY()-1,
                                this.rectangle.getWidth()+2,
                                this.rectangle.getHeight()+2);
    };

    shift(x:number,y:number){
        this.x1 += x;
        this.y1 += y;
        this.x2 += x;
        this.y2 += y;
        this.x3 += x;
        this.y3 += y;
        this.x4 += x;
        this.y4 += y;
        this.rectangle.shift(x,y);
    };

    setPath(context:CanvasRenderingContext2D){

        //context.beginPath();
        context.moveTo(this.x1,this.y1);
        context.bezierCurveTo(this.x2,this.y2,this.x3,this.y3,this.x4,this.y4);//counter-clockwise=false

    };
    stroke(context:CanvasRenderingContext2D){
        context.beginPath();
        this.setPath(context);
        context.stroke();
    };
    fill(context:CanvasRenderingContext2D){
        context.beginPath();
        this.setPath(context);
        context.fill();
    };
    
    toSVGElement(stroke:string | null, strokeWidth:number, fill:string | null):string
    {
        // Q400,50 600,300
        let path = '<path d="M' + this.x1 + ' ' + this.y1;
        path += "C" + this.x2 + " " + this.y2 + " " + this.x3 + " " + this.y3 + " " + this.x4 + " " + this.y4 + '"';
                
        if(stroke)
            path += ' stroke="' + stroke + '"';
        
        if(strokeWidth)
            path += ' stroke-width="' + (strokeWidth) + '"';
        else if(stroke) 
            path += ' stroke-width="2"';
        
                    
        if(fill)
            path += ' fill="' + fill + '"';
        else
            path += ' fill="none"';
        
        path += '/>';
        return path;
    };

}

