
/**
 * Draw Rules for Control Measures
 *
 */
export class DrawRules {

    /**
     * Usually an entry in the MilStd that is just a category containing other symbols
     * and not something that gets drawn itself.
     */
    public static readonly DONOTDRAW: number = 0;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     *
     * Size/Shape: Determined by the anchor points. The information fields
     * should be moveable and scalable as a block within the area.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA1: number = 101;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape. The LAA point symbol
     * requires one anchor point and is connected to the area symbol with a
     * straight line.
     *
     * Size/Shape: Determined by the anchor points. The information fields
     * should be moveable and scalable as a block within the area.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA2: number = 102;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     *
     * Size/Shape: Determined by the anchor points.
     *
     * Orientation: The side opposite Field B (Echelon) faces toward the
     * hostile force.
     */
    public static readonly AREA3: number = 103;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     *
     * Size/Shape: Determined by the anchor points. The information fields
     * should be moveable and scalable as a block within the area. The default
     * tic length should be the same as the text height of the echelon
     * field (B). Spacing between the tics should also be the height of B.
     * Users should be provided a facility to allow them to manually alter the
     * height of B, which in turn should affect the tic length and spacing
     * accordingly.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA4: number = 104;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the semicircle's opening. Point 3 defines the end
     * of the arrow.
     *
     * Size/Shape: Points 1 and 2 determine the diameter of the semicircle and
     * point 3 determines the length of the arrow. The tip of the arrowhead will
     * be at the center point of the semicircle's diameter and will project
     * perpendicularly from the line between points 1 and 2. The default tic
     * length should be the same as the text height of the echelon field (B).
     * Spacing between the tics should also be the height of B. Users should be
     * provided a facility to allow them to manually alter the height of B,
     * which in turn should affect the tic length and spacing accordingly.
     *
     * Orientation: The opening typically faces enemy forces.
     */
    public static readonly AREA5: number = 105;

    /**
     * Anchor Points: This symbol requires two anchor points. Point 1 defines
     * the center point of the symbol and point 2 defines the symbol’s start
     * point and radius.
     *
     * Size/Shape: Points 1 and 2 will determine a radius that is long enough
     * for the graphic to encompass the feature(s) being retained. The opening
     * will be a 30-degree arc of the circle. The default tic length should be
     * the same as the text height of the echelon field (R). Spacing between
     * the tics should also be the height of R. Users should be provided a
     * facility to allow them to manually alter the height of R, which in turn
     * should affect the tic length and spacing accordingly.
     *
     * Orientation: The opening will be on the friendly side of the symbol.
     */
    public static readonly AREA6: number = 106;

    /**
     * Anchor Points: This symbol requires three anchor points. Point 1 is the
     * tip of the arrowhead. Points 2 and 3 define the endpoints of the straight
     * line on the back side of the symbol.
     *
     * Size/Shape: Points 2 and 3 determine the length of the straight line on
     * the back side of the symbol. The rear of the arrowhead line shall connect
     * to the midpoint of the line between points 2 and 3. The arrowhead line shall be perpendicular to the line formed by points 2 and 3.
     *
     * Orientation: Orientation is determined by the anchor points. The back
     * side of the symbol encompasses the firing position, while the arrowhead
     * typically points at the target.
     */
    public static readonly AREA7: number = 107;

    /**
     * Anchor Points: This symbol requires four anchor points. Points 1 and 2
     * define the endpoints of the straight line on the back side of the symbol.
     * Points 3 and 4 define the tips of the arrowheads.
     *
     * Size/Shape: Points 1 and 2 determine the length of the straight line on
     * the back side of the symbol. The rear of the arrows should connect to
     * points 1 and 2.
     *
     * Orientation: Orientation is determined by the anchor points. The back
     * side of the symbol encompasses the firing position, while the arrowheads
     * typically indicate the left and right limits of coverage that the firing
     * position is meant to support.
     */
    public static readonly AREA8: number = 108;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     *
     * Size/Shape: Determined by the anchor points.
     *
     * Orientation: Not applicable. The area will encompass two or more fire
     * support symbols (point/single target, nuclear target, circular target,
     * rectangular target, or area target).
     * The naming convention determines whether the area describes a series or
     * group of targets.
     *
     */
    public static readonly AREA9: number = 109;

    /**
     * Anchor Points: This symbol requires a minimum of three (3) and a maximum
     * of six (6) anchor points to define the boundary of the area. The anchor
     * points shall be sequentially numbered, in increments of one (1),
     * beginning with point one (1).
     *
     * Size/Shape: Determined by the anchor points. The information fields
     * should be moveable and scalable within the area.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA10: number = 110;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol’s vertical line. Point 3 defines the
     * endpoint of the symbol’s horizontal line.
     *
     * Size/Shape: Points 1 and 2 determine the length of the vertical line.
     * The length of the horizontal line is determined by plotting point 3 on a
     * plane extending perpendicularly from the midpoint of the vertical line.
     *
     * Orientation: The head of the "T" typically faces enemy forces.
     */
    public static readonly AREA11: number = 111;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the end points of the symbol’s vertical line. Point 3 defines the
     * tip of the longest arrow.
     *
     * Size/Shape: Points 1 and 2 determine the height of the symbol and point
     * 3 determines its length. The spacing between the symbol’s arrows will
     * stay proportional to the symbol’s vertical line. The length of the short
     * arrows will remain in proportion to the length of the longest arrow.
     *
     * Orientation: The arrows point away from enemy forces.
     */
    public static readonly AREA12: number = 112;

    /**
     * Anchor Points: This symbol requires at least two anchor points. Points
     * 1 and 2 define the corners of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length of the straight line.
     * The radius of the semicircle is ½ the length of the straight line.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA13: number = 113;

    /**
     * Anchor Points: This symbol requires three anchor points. The center point
     * defines the center of the symbol. Points 1 and 2 define the radii of
     * circles 1 and 2.
     *
     * Size/Shape: As defined by the operator.
     *
     * Orientation: The center point is typically centered over Ground Zero (GZ)
     * or Designated Ground Zero (DGZ).
     */
    public static readonly AREA14: number = 114;

    /**
     * Anchor Points: This symbol requires two anchor points. Point 1 defines
     * the center point of the symbol and point 2 defines the symbol’s start
     * point and radius.
     *
     * Size/Shape: The radius will be long enough for the symbol to encompass
     * the UEI(s) or feature(s) being isolated. The opening will be a 30 degree
     * arc of the circle.
     *
     * Orientation: The opening will be on the friendly side of the symbol.
     */
    public static readonly AREA15: number = 115;

    /**
     * Anchor Points: This symbol requires two anchor points. Point 1 defines
     * the center point of the symbol and point 2 defines the symbol’s start
     * point and radius.
     *
     * Size/Shape: Points 1 and 2 will determine a radius that is long enough
     * for the symbol to encompass the feature(s) being occupied. The opening
     * will be a 30-degree arc of the circle.
     *
     * Orientation: The opening will be on the friendly side of the
     * control measure.
     */
    public static readonly AREA16: number = 116;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol’s vertical line. Point 3 defines the
     * rear of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the height of the symbol and
     * point 3 determines its length. The arrow will project perpendicularly
     * from the midpoint of the vertical line.
     *
     * Orientation: The arrow points toward enemy forces.
     */
    public static readonly AREA17: number = 117;

    /**
     * Anchor Points: This symbol requires four anchor points. Point 1 defines
     * the tip of the first arrowhead. Point 2 defines the end of the straight
     * line portion of the first arrow. Point 3 defines the tip of the second
     * arrowhead. Point 4 defines the end of the second arrow.
     *
     * Size/Shape: Points 1 and 2 and points 3 and 4 determine the length of
     * each arrow. Points 2 and 3 shall be connected by a smooth, curved line.
     *
     * Orientation: Determined by the anchor points. The unit being relieved is
     * typically located at the base of the curve and the unit performing the
     * relief is typically located at the end of the symbol. The arrowhead
     * typically points to the location the relieved unit should move to.
     */
    public static readonly AREA18: number = 118;

    /**
     * Anchor Points: This symbol requires two anchor points. Point 1 defines
     * the center point of the symbol and point 2 defines the symbol’s start
     * point and radius.
     *
     * Size/Shape: Points 1 and 2 will determine a radius that is long enough
     * for the symbol to encompass the feature(s) being secured. The opening
     * will be a 30-degree arc of the circle.
     *
     * Orientation: The opening will be on the friendly side of the symbol.
     */
    public static readonly AREA19: number = 119;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area. Add as many points as necessary to
     * accurately reflect the area’s size and shape.
     *
     * Size/Shape: Determined by the anchor points.
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA20: number = 120;

    /**
     * Anchor Points: This symbol requires three anchor points. Point 1 defines
     * the vertex of the symbol. Points 2 and 3 define the tips of the
     * arrowheads.
     *
     * Size/Shape: Points 1 and 2 and points 1 and 3 determine the length of the
     * arrows. The length and orientation of the arrows can vary independently.
     *
     * Orientation: Orientation is determined by the anchor points.
     * The arrowheads may touch other symbols that define the limits of the
     * task. The tactical symbol indicator is centered over point 1.
     */
    public static readonly AREA21: number = 121;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines the center of the symbol.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly AREA22: number = 122;

    /**
     * Anchor Points: This symbol requires at least three anchor points to
     * define the boundary of the area.
     *
     * Size/Shape: Determined by the anchor points
     *
     * Orientation: Not applicable.
     */
    public static readonly AREA23: number = 123;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol’s vertical line. Point 3 defines the
     * endpoint of the symbol’s horizontal line.
     *
     * Size/Shape: Points 1 and 2 determine the length of the vertical line.
     * Points 2 and 3 determine the length of the horizontal line, which will
     * project perpendicularly from the midpoint of the vertical line.
     *
     * Orientation: The head of the "T" typically faces enemy forces.
     */
    public static readonly AREA24: number = 124;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the end points of the symbol’s vertical line. Point 3 defines the
     * tip of the longest arrow.
     *
     * Size/Shape: Points 1 and 2 determine the height of the symbol and
     * point 3 determines its length. The spacing between the symbol’s arrows
     * will stay proportional to the symbol’s vertical line. The length of the
     * short arrows will remain in proportion to the length of the longest
     * arrow. The arrows are perpendicular to the baseline (vertical line) and
     * parallel to each other.
     *
     * Orientation: The arrows typically point toward enemy forces.
     */
    public static readonly AREA25: number = 125;

    /**
     * Anchor Points: This symbol requires a minimum of 6 anchor points. Add as
     * many pairs of points as needed to accurately define the areas. The number
     * of points shall always be an even number, with an equal number of points
     * for both polygons. Points 1 through N/2 define the inner safe zone
     * (zone 1). Points N/2 +1 though point N defines the outer zone (zone 2).
     *
     * Size/Shape: Determined by the anchor points.
     *
     * Orientation: The symbol will typically be oriented upright.
     */
    public static readonly AREA26: number = 126;


    /**
     * Anchor Points: This symbol requires one anchor point. The anchor point
     * defines/is the tip of the inverted cone.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol will typically be oriented upright.
     */
    public static readonly POINT1: number = 201;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines/is the center of the symbol.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly POINT2: number = 202;

    /**
     * Anchor Points: This symbol requires one anchor point.
     * The center point defines the center of the symbol.
     *
     * Size/Shape: Static. Maneuver area symbol shall be drawn with a black
     * border. Maneuver areas may be either unfilled or filled with
     * performance-contoured color options
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly POINT3: number = 203;

    /**
     * Anchor Points: This symbol requires one anchor point. The point defines
     * the bottom of the central vertical line in the symbol where the curved
     * and vertical lines meet.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol will typically be oriented upright (as shown in the template and example).
     */
    public static readonly POINT4: number = 204;

    /**
     * Anchor Points: This symbol requires one anchor point. The point defines
     * the point where all the lines meet.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol will typically be oriented upright (as shown in
     * the example).
     */
    public static readonly POINT5: number = 205;

    /**
     * Anchor Points: This symbol requires one anchor point. The anchor point
     * defines/is the center of the bottom of the control measure symbol as
     * shown in the template and example.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol will typically be oriented upright.
     */
    public static readonly POINT6: number = 206;

    /**
     * Anchor Points: This symbol requires one anchor point. The anchor point
     * defines the midpoint of the symbol's base.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol will typically be oriented upright (as shown in
     * the template and example).
     */
    public static readonly POINT7: number = 207;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines the center of the symbol.
     *
     * Size/Shape: Static. The symbol's corners form a 70- degree angle.
     *
     * Orientation: The symbol is typically centered over the desired location.
     * A user can use this symbol to define a new type of point if the selection
     * that follows is not sufficient.
     */
    public static readonly POINT8: number = 208;

    /**
     * Anchor Points: This symbol requires one anchor (center) point. The point
     * defines the center of the symbol.
     *
     * Size/Shape: Static. The symbol's height should be 2x the symbol's width.
     *
     * Orientation: The symbol's center point is typically centered over the
     * desired location. The symbol shall be oriented upright, as shown in the
     * examples.
     */
    public static readonly POINT9: number = 209;

    /**
     * Anchor Points: This symbol requires one anchor point. The point defines
     * the center of the circle. (Sonobuoy)
     *
     * Size/Shape: Static. The diameter of the circle should be 1/2 the height
     * of the symbol.
     *
     * Orientation: The symbol's center point is typically centered over the
     * desired location. The symbol will be oriented upright, as shown in the
     * example.
     */
    public static readonly POINT10: number = 210;

    /**
     * Anchor Points: This symbol requires one center point. The point defines
     * the center of the symbol.
     *
     * Size/Shape: Static. Length is 2x the size of height.
     *
     * Orientation: The symbol is centered over the desired location. The symbol
     * shall be oriented upright, as shown in the example.
     */
    public static readonly POINT11: number = 211;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the tips of the arrowheads and point 3 defines the rear of the
     * symbol.
     *
     * Size/Shape: Points 1 and 2 determine the symbol's height and point 3
     * determines its length. The vertical line at the rear of the symbol shall
     * be the same length as the opening, and shall be perpendicular to the
     * parallel lines formed with the rear of symbol vertical line and the lines
     * ending with points 1 and 2.
     *
     * Orientation: The opening typically faces the applicable obstacle.
     */
    public static readonly POINT12: number = 212;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines the center of the circle.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly POINT13: number = 213;

    /**
     * Anchor Points: This symbol requires one anchor point. The center point
     * defines the center of the symbol.
     *
     * Size/Shape: There should be 45 degrees of angular separation between the
     * two arrows.
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly POINT14: number = 214;

    /**
     * Anchor Points: This symbol requires one anchor point. The anchor point
     * defines "nose" of the symbol.
     *
     * Size/Shape: Static.
     *
     * Orientation: The symbol is typically centered over the desired location.
     */
    public static readonly POINT15: number = 215;

    /**
     * Anchor Points: This symbol requires one anchor point; the point defines
     * the circle at the base of the tower.
     *
     * Size/Shape: The symbol is a high-angle cone.
     *
     * Orientation: The symbol will remain upright.
     */
    public static readonly POINT16: number = 216;

    /**
     * Anchor Points: This symbol requires one anchor point. This anchor point
     * represents the center of the rectangle and, therefore, the geographic
     * location of that rectangle.
     *
     * Size/Shape: The size and shape of this symbol is determined by three
     * additional numeric values; A length (AM1), a width (AM2), and a
     * rotation angle. The length and width should be expressed in the
     * appropriate map distance units. The length is aligned with the axis of
     * rotation. The width is aligned perpendicular to the axis of rotation.
     *
     * Orientation: The orientation of this symbol is determined by the
     * rotation angle provided, where 0 degrees is North and a positive
     * rotation angle rotates the rectangle in a clockwise direction.
     */
    public static readonly POINT17: number = 217;

    /**
     * Anchor Points: This symbol requires one anchor point that defines the
     * axis of angular rotation.
     *
     * Size/Shape: The size and shape of this symbol is determined by additional
     * numeric values; A search axis azimuth, a start range, a stop range and a
     * stop relative bearing. The stop relative bearing is an equal angle either
     * side of the search axis. The start and stop range should be expressed in
     * the appropriate map distance units. Field T should be positioned in the
     * center of the search area aligned with the search axis.
     *
     * Orientation: The orientation of this symbol is determined by the search
     * axis azimuth provided.
     */
    public static readonly POINT18: number = 218;

    /**
     * Anchor Points: This symbol requires at least two anchor points, points 1
     * and 2, to define the line. Additional points can be defined to extend the
     * line.
     *
     * Size/Shape: The first and last anchor points determine the length of the
     * line.
     *
     * Orientation: Orientation is determined by the order in which the anchor points are entered.
     */
    public static readonly LINE1: number = 301;

    /**
     * Anchor Points: This symbol requires at least two anchor points, points
     * 1 and 2, to define the line. Additional points can be defined to extend
     * the line.
     *
     * Size/Shape: The first and last anchor points determine the length of the line.
     * The end-of line information will typically be posted at the ends of the line
     * as it is displayed on the screen.
     *
     * Orientation: Orientation is determined by the order in which the anchor points
     * are entered.
     */
    public static readonly LINE2: number = 302;

    /**
     * Anchor Points: This symbol requires three anchor points. Point 1 defines
     * the vertex of the symbol. Points 2 and 3 define the tips of the arrowheads.
     *
     * Size/Shape: The length and orientation of the arrows can vary
     * independently.
     *
     * Orientation: Orientation is determined by the anchor points. The
     * arrowheads may touch other symbols that define the limits of the task.
     * The top of the tactical symbol indicator may touch point 1
     */
    public static readonly LINE3: number = 303;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and 2
     * define the corner points of the symbol.
     *
     * Size/Shape: The symbol varies only in length.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE4: number = 304;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and 2
     * define the endpoints of the symbol.
     *
     * Size/Shape: The symbol varies only in length.
     *
     * Orientation: One point defines the origin from which the bearing is being
     * taken and the other point defines the location or direction from which a
     * contact is made.
     */
    public static readonly LINE5: number = 305;

    /**
     * Anchor Points: This symbol requires 3 anchor points. Point 1 defines the
     * vertex of the symbol and points 2 and 3 define its endpoints.
     *
     * Size/Shape: Points 1, 2 and 3 determine the length of the lines
     * connecting them. The line defined by points 1 and 2 is typically the same
     * length as the line between points 2 and 3.
     *
     * Orientation: Orientation is determined by the anchor points
     */
    public static readonly LINE6: number = 306;

    /**
     * Anchor Points: This symbol requires at least two anchor points, points
     * 1 and 2, to define the line. Additional points can be defined to extend
     * the line.
     *
     * Size/Shape: The first and last anchor points determine the length of the
     * line. The line information will be posted once at the center of the line
     * as it is displayed on the screen.
     *
     * Orientation: Orientation is determined by the order in which the anchor
     * points are entered.
     */
    public static readonly LINE7: number = 307;

    /**
     * Anchor Points: This symbol requires a minimum of two (2) anchor points.
     * Up to 298 additional points can be added to extend the line. The first
     * point (point 1) defines the start point. The last point defines the
     * endpoint. The points are numbered sequentially beginning with point one (1), in increments of one.
     *
     * Size/Shape: The anchor points define the size and shape.
     *
     * Orientation: The orientation is determined by the anchor points.
     */
    public static readonly LINE8: number = 308;

    /**
     * Anchor Points: This symbol requires 2 anchor points. Point 1 defines the
     * tip of the arrowhead and point 2 defines the rear of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length.
     *
     * Orientation: The orientation is determined by the anchor points.
     */
    public static readonly LINE9: number = 309;

    /**
     * Anchor Points: This symbol requires two anchor points. Point 1 defines
     * the tip of the arrowhead and point 2 defines the rear of the symbol.
     * Point 3 defines the 90 degree arc.
     *
     * Size/Shape: Points 1 and 2 are connected by a 90 degree arc. Point 3
     * indicates on which side of the line the arc is placed.
     *
     * Orientation: The rear of the symbol identifies the enemy’s location and
     * the arrow points in the direction the obstacle should force the enemy to
     * turn.
     */
    public static readonly LINE10: number = 310;

    /**
     * Anchor Points: This symbol requires four points. Points 1 and 2 define
     * one side of the gap and points 3 and 4 define the opposite side of the
     * gap.
     *
     * Size/Shape. Determined by the anchor points.
     *
     * Orientation: Not applicable.
     */
    public static readonly LINE11: number = 311;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol and point 3 defines the location of
     * one side of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the centerline of the symbol and
     * point 3 determines its width.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE12: number = 312;

    /**
     * Anchor Points: This symbol requires at least two anchor points, points 1
     * and 2, to define the line. Additional points can be defined to extend the
     * line.
     *
     * Size/Shape: The first and last anchor points determine the length of the
     * line. The size of the tooth does not change.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE13: number = 313;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and 2
     * define the tips of the arrowheads.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length. The lines of the arrowhead will form an acute
     * angle.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE14: number = 314;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and 2
     * define the length and orientation of the straight line (trip wire)
     * portion of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length and orientation of the
     * line drawn from the physical mine to the end of the trip wire. The
     * distance between the line connecting points 1 and 2 is the length of
     * the trip wire connected to the mine.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE15: number = 315;

    /**
     * Anchor Points: This symbol requires four points. Points 1 and 2 define
     * one side of the assault crossing site and points 3 and 4 define the
     * opposite side of the assault crossing site.
     *
     * Size/Shape: Determined by the anchor points.
     *
     * Orientation: Not applicable.
     */
    public static readonly LINE16: number = 316;

    /**
     * Anchor Points. This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the first line. Point 3 defines the location of
     * the parallel line.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol. Point 3
     * determines its width.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE17: number = 317;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and two
     * define the tips of the arrowheads.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length. The arrowheads will be filled-in versions of a
     * common arrowhead.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE18: number = 318;

    /**
     * Anchor Points: This symbol requires two anchor points. Points 1 and two
     * define the corners on the front of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length.
     *
     * Orientation: Orientation is determined by the anchor points
     */
    public static readonly LINE19: number = 319;

    /**
     * Anchor Points: This graphic requires two anchor points. Point 1 defines
     * the tip of the arrowhead, and point 2 defines the rear of the graphic.
     *
     * Size/Shape: Points 1 and 2 determine the length of the graphic, which
     * varies only in length.
     *
     * Orientation: The arrow points to the location where the convoy has halted.
     */
    public static readonly LINE20: number = 320;

    /**
     * Anchor Points: This symbol requires at least two anchor points to define
     * the line. Additional points can be defined to extend and shape the line.
     *
     * Size/Shape: The first and last anchor points determine the length of the
     * line. The line segment between each pair of anchor points will repeat all
     * information associated with the line segment.
     *
     * Orientation: Orientation is determined by the anchor points.
     */
    public static readonly LINE21: number = 321;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol’s opening and point 3 defines the rear
     * of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the symbol’s height and point 3
     * determines its length. The vertical line at the rear of the symbol will
     * be the same height as the opening and parallel to it.
     *
     * Orientation: The opening defines the span of the breach and typically
     * faces enemy forces.
     */
    public static readonly LINE22: number = 322;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the symbol’s vertical line and point 3 defines
     * the rear of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the symbol’s height and point 3
     * determines its length. The spacing between the symbol’s arrows will stay
     * proportional to the symbol’s height. The tip of the middle arrowhead will
     * be at the midpoint of the vertical line. The arrows will stay
     * perpendicular to the vertical line, regardless of the rotational
     * orientation of the symbol as a whole.
     *
     * Orientation: The arrows typically point toward enemy forces.
     */
    public static readonly LINE23: number = 323;

    /**
     * Anchor Points: This symbol requires three anchor points. Point 1 defines
     * the tip of the arrowhead. Point 2 defines the end of the straight line
     * portion of the symbol. Point 3 defines the diameter and orientation of
     * the 180 degree circular arc.
     *
     * Size/Shape: Points 1 and 2 determine the length of the straight line
     * portion of the symbol.
     * Point 3 defines which side of the line the arc is on and the diameter of
     * the arc.
     *
     * Orientation: The arrow points in the direction of the action. The tip of
     * the arrowhead may indicate the location where the action is to conclude.
     * The unit’s current location is typically represented at the base of the
     * arc. The 180 degree circular arc is always perpendicular to the line.
     */
    public static readonly LINE24: number = 324;

    /**
     * Anchor Points: This symbol requires exactly two anchor points. Point 1
     * defines the tip of the arrowhead and point 2 defines the rear of the
     * symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length.
     *
     * Orientation: The arrow typically points in the direction of the action.
     */
    public static readonly LINE25: number = 325;

    /**
     * Anchor Points: Where four points are available Point 1 and Point 2 define
     * the ends of one arrow and Point 3 and Point 4 define the ends of the
     * other arrow. Point 1 and Point 4 define the ends of their respective
     * arrowheads. Where three points are available Point 1 defines the vertex
     * of the symbol. Points 2 and 3 define the tips of the arrowheads.
     *
     * Size/Shape: Where four points are available, Points 1 and 2 and Points
     * 3 and 4 determine the length of the arrows. Where three points are
     * available Points 1 and 2 and points 1 and 3 determine the length of the
     * arrows. The length and orientation of the arrows can vary independently.
     *
     * Orientation: Orientation is determined by the anchor points.
     * The arrowheads may touch other symbols that define the limits of the
     * task. The tactical symbol indicator is centered between point 2 and
     * point 3 when four points are in use or centered on Point 1 when three
     * points are in use.
     */
    public static readonly LINE26: number = 326;

    /**
     * Anchor Points: Where four points are available Point 1 defines the center
     * of the circle. Point 2 defines the radius of the circle. Point 3 defines
     * the curvature of the arc. Point 4 defines the end of the arrow. Where
     * three points are available Point 1 defines the center point of the
     * circle. Point 2 defines the tip of the arrowhead. Point 3 defines the
     * 90 degree arc.
     *
     * Size/Shape: Where four points are available, Points 1 and 2 define the
     * size of the circle, which should be adjusted as needed to contain the
     * unit assigned the task. Point 3 controls the curvature of the arc.
     * Point 4 defines the end of the arrow. Where three points are available
     * Points 1 and 2 are connected by a 90 degree arc. The circle will at least
     * be large enough to accommodate a tactical symbol. Point 3 indicates on
     * which side of the line the arc is placed.
     *
     * Orientation: The arrowhead identifies the location/object to be seized
     * and the circle identifies the unit(s) assigned the task. See 5.3.11 for
     * options to accommodate multiple units.
     */
    public static readonly LINE27: number = 327;

    /**
     * Anchor Points: This symbol requires 2 anchor points. Point 1 defines the
     * tip of the arrowhead, and point 2 defines the rear of the symbol.
     *
     * Size/Shape: Points 1 and 2 determine the length of the symbol, which
     * varies only in length.
     *
     * Orientation: The arrow typically points toward enemy forces with the tip
     * of the arrowhead indicating the location of the action.
     *
     * Duplicate of Line9 so removed in 2525E
     */
    public static readonly LINE28: number = 328;

    /**
     * Anchor Points: This symbol requires three anchor points. Point 1 is the
     * tip of the arrowhead. Points 2 and 3 define the endpoints of the curved
     * line on the back side of the symbol.
     *
     * Size/Shape: Points 2 and 3 determine the length of the curved line on the
     * back side of the symbol. The rear of the arrowhead line shall connect to
     * the midpoint of the line between points 2 and 3. The arrowhead line shall
     * be perpendicular to the line formed by points 2 and 3.
     *
     * Orientation: Orientation is determined by the anchor points. The back
     * side of the symbol encompasses the ambush position, while the arrowhead
     * typically points at the target.
     */
    public static readonly LINE29: number = 329;

    /**
     * Anchor Points: This symbol may contain multiple segments. Each segment
     * requires 2 anchor points. Point numbers that define the trace of the
     * segment are sequential beginning with point 1, in increments of 1, up to
     * a max of 99 points. Each anchor point defines the endpoint of a segment’s
     * center line. The anchor points are Air Control Points (ACP),
     * Communications Checkpoints (CCP) or both.
     *
     * Size/Shape: Points 1 and 2 determine the length of a segment. The
     * information field inside each segment should be moveable and scalable
     * within each segment. The information box outside the symbol should be
     * placed between points 1 and 2 in such a way it does not obscure the
     * symbol.
     *
     * Orientation: The anchor points determine orientation.
     */
    public static readonly CORRIDOR1: number = 401;


    /**
     * Anchor Points: The symbol requires N anchor points, where N is between
     * 3 and 50. Point 1 defines the tip of the arrowhead. Point N-1 defines
     * the rear of the symbol. Point N defines the back of the arrowhead.
     * Anchor points are numbered sequentially beginning with point number
     * one (1), in increments of one (1).
     *
     * Size/Shape: Points 1 through N-1 and 2 determine the symbol’s center line
     * and Point N determines the width. The crossover point on the symbol shall
     * occur between Points 1 and 2.
     *
     * Orientation: The arrowhead typically points toward enemy forces.
     */
    public static readonly AXIS1: number = 501;

    /**
     * Anchor Points: The symbol requires N anchor points, where N is between 3
     * and 50. Point 1 defines the tip of the arrowhead. Point N-1 defines the
     * rear of the symbol. Point N defines the back of the arrowhead. Anchor
     * points are numbered sequentially beginning with point number one (1), in
     * increments of one (1).
     *
     * Size/Shape: Points 1 through N-1 and 2 determine the symbol’s center line
     * and Point N determines the width.
     *
     * Orientation: The arrowhead typically points toward enemy forces.
     */
    public static readonly AXIS2: number = 502;

    /**
     * Anchor Points: This symbol requires three anchor points. Points 1 and 2
     * define the endpoints of the infiltration lane and point 3 defines the
     * width on one side of the lane.
     *
     * Size/Shape: Points 1 and 2 determine the center line of the symbol and
     * point 3 determines the width of the infiltration lane. The rest of the
     * symbol stays proportional to the length of the center line.
     *
     * Orientation: Orientation is determined by points 1 and 2.
     */
    public static readonly POLYLINE1: number = 601;

    /**
     * Anchor Points: This symbol requires one anchor point. This anchor point
     * represents the center of an ellipse and, therefore, the geographic
     * location of that ellipse.
     *
     * Size/Shape: The size and shape of this symbol is determined by three
     * additional numeric values; A major axis radius, a minor axis radius, and
     * a rotation angle. The radii should be expressed in the appropriate map
     * distance units.
     *
     * Orientation: The orientation of this symbol is determined by the rotation
     * angle provided, where 0 degrees is east/west and a positive rotation
     * angle rotates the ellipse in a counter-clockwise direction.
     */
    public static readonly ELLIPSE1: number = 701;

    /**
     * Anchor Points: This symbol requires two anchor points and a width,
     * defined in meters, to define the boundary of the area. Points 1 and 2
     * will be located in the center of two opposing sides of the rectangle.
     *
     * Size/Shape: Size: As determined by the anchor points. The anchor points
     * determine the length of the rectangle. The width, defined in meters,
     * will determine the width of the rectangle. Shape: Rectangle. The
     * information fields should be moveable and scalable.
     *
     * Orientation: As determined by the anchor points.
     */
    public static readonly RECTANGULAR1: number = 801;

    /**
     * Anchor Points: This symbol requires one (1) anchor point to define the
     * center of the area.
     *
     * Size/Shape: Size Is determined by the anchor point, the target length
     * (in meters) and target width (in meters). A rectangular target is wider
     * and longer than 200 meters. The information fields should be moveable and
     * saleable within the area. Shape: Rectangle.
     *
     * Orientation: As determined by the Target Attitude (in mils).
     */
    public static readonly RECTANGULAR2: number = 802;

    /**
     * Anchor Points: This symbol requires one anchor (center) point to define
     * the center of the symbol. The target tactical symbol shall be centered
     * upon the center of the area. The size and the orientation of the target
     * symbol are fixed within the area.
     *
     * Size/Shape: As determined by the anchor points. The anchor points
     * determine the area’s length.
     * Width, determined in meters, will define the width of the rectangle.
     *
     * Orientation: As determined by the anchor points. The center point of the
     * area shall always have the target symbol with the same
     * upright orientation.
     */
    public static readonly RECTANGULAR3: number = 803;


    /**
     * Anchor Points: This symbol requires one (1) anchor point and a radius.
     * Point 1 defines the center point of the symbol.
     *
     * Size/Shape: Size: The radius defines the size. Shape: Circle. The
     * information fields should be scalable within the circle.
     *
     * Orientation: Not applicable
     */
    public static readonly CIRCULAR1: number = 901;

    /**
     * Anchor Points: This symbol requires one anchor point that defines an
     * object at a dynamic grid location. This coordinate, which pinpoints the
     * current physical location of a specific unit, weapon or acquisition
     * system, may change with the movement of the object. The symbol for that
     * object is located at the anchor point.
     *
     * Size/Shape: The size is determined by the distance in meters from the
     * object at the center of the range fan. The shapes are concentric circles.
     * A minimum of one (1) and a maximum of three (3) concentric circles can be
     * used.
     *
     * Orientation: The center point is typically centered over the known
     * location of a weapon or sensor system.
     */
    public static readonly CIRCULAR2: number = 902;

    /**
     * Anchor Points: This graphic requires one anchor point that defines an
     * object at a dynamic grid location. This coordinate, which pinpoints the
     * current physical location of a specific unit, weapon or sensor system,
     * may change with the movement of the object. The symbol for that object
     * is located at the anchor point.
     *
     * Size/Shape: Determined by the anchor point, azimuths measured from true
     * north, and the distance (range) in meters. The Left Sector Azimuth is the
     * angle measured from true north to the left sector limit/edge of the
     * Sector Range Fan. The Right Sector Azimuth is the angle measured from
     * true north to the right sector limit/edge of the Sector Range Fan.
     * Multiple distances (ranges) and/or left and right sector limits/edges
     * of the sector, as well as altitude, may be added as required to define
     * the sector. All azimuths are in degrees. All distances (ranges) are in
     * meters. All altitudes are in feet.
     *
     * Orientation: The center point is typically centered over the known
     * location of a weapon or sensor system. The orientation may change as
     * the object moves or changes.
     */
    public static readonly ARC1: number = 1001;


}
