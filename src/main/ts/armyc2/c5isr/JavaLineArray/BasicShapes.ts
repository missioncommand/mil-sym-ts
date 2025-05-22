import { TacticalLines } from "./TacticalLines";
import { DrawRules } from "../renderer/utilities/DrawRules";

export class BasicShapes {
    /**
     * Anchor Points: This symbol requires at least two anchor points, points 1
     * and 2, to define the line. Additional points can be defined to extend the
     * line.
     * <p>
     * Size/Shape: The first and last anchor points determine the length of the
     * line.
     * <p>
     * Orientation: Orientation is determined by the order in which the anchor points are entered.
     * <p>
     * Modifiers: T
     *
     * @see DrawRules.LINE1
     */
    public static readonly LINE = TacticalLines.BS_LINE;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     * <p>
     * Size/Shape: Determined by the anchor points. The information fields
     * should be moveable and scalable as a block within the area.
     * <p>
     * Modifiers: T
     *
     * @see DrawRules.AREA1
     */
    public static readonly AREA = TacticalLines.BS_AREA;

    /**
     * Anchor Points: This symbol requires one anchor point. This anchor point
     * represents the center of an ellipse and, therefore, the geographic
     * location of that ellipse.
     * <p>
     * Size/Shape: The size and shape of this symbol is determined by three
     * additional numeric values; A major axis radius, a minor axis radius, and
     * a rotation angle. The radii should be expressed in the appropriate map
     * distance units.
     * <p>
     * Orientation: The orientation of this symbol is determined by the rotation
     * angle provided, where 0 degrees is east/west and a positive rotation
     * angle rotates the ellipse in a counter-clockwise direction.
     * <p>
     * Modifiers: AM, AN, T
     *
     * @see DrawRules.ELLIPSE1
     */
    public static readonly ELLIPSE = TacticalLines.PBS_ELLIPSE;

    /**
     * Anchor Points: This symbol requires one (1) anchor point and a radius.
     * Point 1 defines the center point of the symbol.
     * <p>
     * Size/Shape: Size: The radius defines the size.
     * <p>
     * Orientation: Not applicable
     * <p>
     * Modifiers: AM, T
     *
     * @see DrawRules.CIRCULAR1
     */
    public static readonly CIRCLE = TacticalLines.PBS_CIRCLE;

    /**
     * Anchor Points: This symbol requires one (1) anchor point to define the
     * center of the area.
     * <p>
     * Size/Shape: Size is determined by the anchor point, the length (in meters)
     * and width (in meters).
     * <p>
     * Orientation: The orientation of this symbol is determined by the rotation
     * angle provided, where 0 degrees is east/west and a positive rotation
     * angle rotates the ellipse in a clockwise direction.
     * <p>
     * Modifiers: AM, AN, T
     *
     * @see DrawRules.RECTANGULAR2
     */
    public static readonly RECTANGLE = TacticalLines.PBS_RECTANGLE;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines/is the center of the symbol.
     * <p>
     * Size/Shape: Line width defines the size of the point. The radius defines the size of the outline.
     * <p>
     * Orientation: Not applicable
     * <p>
     * Modifiers: AM, T
     *
     * @see DrawRules.POINT2
     */
    public static readonly POINT = TacticalLines.BBS_POINT;
}