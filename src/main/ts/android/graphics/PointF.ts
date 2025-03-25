export class PointF
{
    public x:number = 0;
    public y:number = 0;
    private constructor(xval?:number,yval?:number)
    {
        
        if (arguments.length === 2)
        {
            this.x = xval;
            this.y = yval;
        }
    }
};