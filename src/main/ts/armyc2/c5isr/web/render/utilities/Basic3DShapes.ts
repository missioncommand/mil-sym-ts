import { TacticalLines } from "../../../JavaLineArray/TacticalLines";
import { Modifiers } from "../../../renderer/utilities/Modifiers";

export class Basic3DShapes {

    /**
     * Anchor Points: This shape requires one anchor point
     * 
     * Modifiers: radius ({@link Modifiers.AM_DISTANCE}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     *
     * @see DrawRules.CIRCULAR1
     */
    public static readonly CYLINDER = TacticalLines.PBS_CIRCLE;

    /**
     * Anchor Points: This shape requires two anchor points
     * 
     * Modifiers: width ({@link Modifiers.AM_DISTANCE}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly ORBIT = TacticalLines.BS_ORBIT;

    /**
     * Anchor Points: This shape requires at least two anchor points
     * 
     * Modifiers: width ({@link Modifiers.AM_DISTANCE}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly ROUTE = TacticalLines.BS_3D_ROUTE;

    /**
     * Anchor Points: This shape requires at least three anchor points
     * 
     * Modifiers: min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly POLYGON = TacticalLines.BS_AREA;

    /**
     * Anchor Points: This shape requires one anchor point
     * 
     * Modifiers: min radius and max radius ({@link Modifiers.AM_DISTANCE}), left and right azimuth ({@link Modifiers.AN_AZIMUTH}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly RADARC = TacticalLines.BS_3D_RADARC;

    /**
     * Anchor Points: This shape requires at least three anchor points
     * 
     * Modifiers: radius ({@link Modifiers.AM_DISTANCE}), left and right azimuth ({@link Modifiers.AN_AZIMUTH}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly POLYARC = TacticalLines.BS_POLYARC;

    /** 
     * A collection of radarcs
     * 
     * Anchor Points: This shape requires one anchor point
     * 
     * Modifiers (for each radarc): min radius and max radius ({@link Modifiers.AM_DISTANCE}), left and right azimuth ({@link Modifiers.AN_AZIMUTH}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly CAKE = TacticalLines.BS_3D_CAKE;

    /**
     * A collection of routes
     * 
     * Anchor Points: This shape requires at least two anchor points
     * 
     * Modifiers (for each segment): left and right width ({@link Modifiers.AM_DISTANCE}), and min and max altitude ({@link Modifiers.X_ALTITUDE_DEPTH}).
     */
    public static readonly TRACK = TacticalLines.BS_3D_TRACK;
}