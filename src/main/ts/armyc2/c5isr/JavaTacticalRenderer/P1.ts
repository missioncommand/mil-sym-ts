import { type int } from "../graphics2d/BasicTypes";


/**
 * Class used by channels for dtermining segments. Segments are used by
 * clsChannelUtility to handle double-backed segments so that the lines
 * will not go off the display area.
 * 
 *
 */
export class P1 {
    public start: int = 0;
    public end_Renamed: int = 0;
}
