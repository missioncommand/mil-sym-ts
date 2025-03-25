export class ShapeTypes{
    public static readonly RECTANGLE = "RECTANGLE";
    public static readonly POINT = "POINT";
    public static readonly ELLIPSE = "ELLIPSE";
    public static readonly ROUNDED_RECTANGLE = "ROUNDED_RECTANGLE";
    public static readonly LINE = "LINE";
    public static readonly BCURVE = "BCURVE";
    public static readonly ARC = "ARC";
    public static readonly PATH = "PATH";
}

export class ActionTypes{
    public static readonly ACTION_MOVE_TO = 0;
    public static readonly ACTION_LINE_TO = 1;
    public static readonly ACTION_CURVE_TO = 2;//cubic bezier cirve
    public static readonly ACTION_QUAD_TO = 3;//quadratic bezier curve
    public static readonly ACTION_ARC_TO = 4;
    public static readonly ACTION_ARC = 5;
	public static readonly ACTION_DASHED_LINE_TO = 6;
}    


    

   
