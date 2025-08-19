import { BasicShapes } from "../../../JavaLineArray/BasicShapes";
import { TacticalLines } from "../../../JavaLineArray/TacticalLines";

export class Basic3DShapes {

    public static readonly CYLINDER = BasicShapes.CIRCLE;

    public static readonly ORBIT: never; // TODO

    public static readonly ROUTE = TacticalLines.BS_3D_ROUTE;

    public static readonly POLYGON = BasicShapes.AREA;

    public static readonly RADARC: never; // TODO

    public static readonly POLYARC: never; // TODO

    public static readonly CAKE: never; // TODO

    public static readonly TRACK = TacticalLines.BS_3D_TRACK;
}