import { Rectangle } from "./rectangle";
import { ShapeTypes } from "./types";

export class Arc
{

    private x:number;
    private y:number;
    private r:number;
    private sa:number;
    private ea:number;
    private rectangle:Rectangle;

    constructor(x:number,y:number,r:number,sa:number,ea:number) 
    {

        this.x = x,
        this.y = y,
        this.r = r,
        this.sa = sa * (Math.PI / 180),
        this.ea = ea * (Math.PI / 180);
        //not accurate, covers the whole circle, not just the arc.
        this.rectangle = new Rectangle(x-r,y-r,r*2,r*2);
    }

    getShapeType():string
    {
        return ShapeTypes.ARC;
    }

    getBounds():Rectangle
    {
        return new Rectangle(this.rectangle.getX(),
                                this.rectangle.getY(),
                                this.rectangle.getWidth(),
                                this.rectangle.getHeight());
    }

    
    shift(x:number,y:number){
        this.x +=x;
        this.y +=y;
        this.rectangle.shift(x,y);
    }

    setPath(context:CanvasRenderingContext2D){

        //context.beginPath();
        context.arc(this.x,this.y,this.r,this.sa,this.ea,false);//counter-clockwise=false

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

}

