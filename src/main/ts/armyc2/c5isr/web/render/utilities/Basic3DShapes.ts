import { BasicShapes } from "../../../JavaLineArray/BasicShapes";
import { TacticalLines } from "../../../JavaLineArray/TacticalLines";

export class Basic3DShapes {

    public static readonly CYLINDER = BasicShapes.CIRCLE;

    public static readonly ORBIT = TacticalLines.BS_ORBIT;

    public static readonly ROUTE = TacticalLines.BS_3D_ROUTE;

    public static readonly POLYGON = BasicShapes.AREA;

    public static readonly RADARC = TacticalLines.BS_3D_RADARC;

    public static readonly POLYARC = TacticalLines.BS_POLYARC;

    public static readonly CAKE = TacticalLines.BS_3D_CAKE;

    public static readonly TRACK = TacticalLines.BS_3D_TRACK;
}