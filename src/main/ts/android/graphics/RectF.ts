export class RectF 
{
    public top = 0;
    public left = 0;
    public bottom = 0;
    public right = 0;
    
    public constructor();
    public constructor(left:number,top:number,right:number,bottom:number);
    public constructor(...args: unknown[])
    {
        switch (args.length) 
        {
            case 4: {
                const [left, top, right, bottom] = args as [number, number,number, number];
                if (arguments.length === 4)
                {
                    this.left = left;
                    this.top = top;
                    this.right = right;
                    this.bottom = bottom;
                }
            }
        }
    }
    
    public static intersects(a:RectF, b:RectF): boolean {
        if (a.contains(b.left, b.top))
            return true;
        else if (a.contains(b.left, b.bottom))
            return true;
        else if (a.contains(b.right, b.top))
            return true;
        else if (a.contains(b.right, b.bottom))
            return true;
        return false;
    };
    public width():number {
        return this.right - this.left;
    };
    public height():number {
        return this.bottom - this.top;
    };
    public contains(x:number, y:number):boolean {
        if (this.left < x && x < this.right)
            if (this.top < y && y < this.bottom)
                return true;
        return false;
    };
};