/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Copyright 1997-2006 Sun Microsystems, Inc. All Rights Reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation. Sun designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Sun in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Sun Microsystems, Inc., 4150 Network Circle, Santa Clara,
 * CA 95054 USA or visit www.sun.com if you need additional information or
 * have any questions.
 */


import { type double, type float, type long, type int } from "../graphics2d/BasicTypes";


import { Point2D } from "../graphics2d/Point2D"
import { Rectangle2D } from "../graphics2d/Rectangle2D"
import { Shape } from "../graphics2d/Shape"


/**
 * This <code>Line2D</code> represents a line segment in {@code (x,y)}
 * coordinate space. This class, like all of the Java 2D API, uses a default
 * coordinate system called <i>user space</i> in which the y-axis values
 * increase downward and x-axis values increase to the right. For more
 * information on the user space coordinate system, see the <a href=
 * "http://java.sun.com/j2se/1.3/docs/guide/2d/spec/j2d-intro.fm2.html#61857">
 * Coordinate Systems</a> section of the Java 2D Programmer's Guide.
 * <p>
 * This class is only the abstract superclass for all objects that store a 2D
 * line segment. The actual storage representation of the coordinates is left to
 * the subclass.
 *
 * @author Jim Graham
 * @since 1.2
 */
export class Line2D {
    public intersectsLine(edge: Line2D): boolean {
        return Line2D.linesIntersect(edge.getX1(), edge.getY1(), edge.getX2(), edge.getY2(),
            this.getX1(), this.getY1(), this.getX2(), this.getY2());
    }

    public static linesIntersect(x1: double, y1: double,
        x2: double, y2: double,
        x3: double, y3: double,
        x4: double, y4: double): boolean {
        return ((Line2D.relativeCCW(x1, y1, x2, y2, x3, y3) *
            Line2D.relativeCCW(x1, y1, x2, y2, x4, y4) <= 0)
            && (Line2D.relativeCCW(x3, y3, x4, y4, x1, y1) *
                Line2D.relativeCCW(x3, y3, x4, y4, x2, y2) <= 0));
    }



    /**
     * The X coordinate of the start point of the line segment.
     *
     * @since 1.2
     * @serial
     */
    public x1: double = 0;
    /**
     * The Y coordinate of the start point of the line segment.
     *
     * @since 1.2
     * @serial
     */
    public y1: double = 0;
    /**
     * The X coordinate of the end point of the line segment.
     *
     * @since 1.2
     * @serial
     */
    public x2: double = 0;
    /**
     * The Y coordinate of the end point of the line segment.
     *
     * @since 1.2
     * @serial
     */
    public y2: double = 0;

    /**
     * Constructs and initializes a Line with coordinates (0, 0) -&gt; (0, 0).
     *
     * @since 1.2
     */
    public constructor();

    /**
     * Constructs and initializes a <code>Line2D</code> from the specified
     * <code>Point2D</code> objects.
     *
     * @param p1
     * the start <code>Point2D</code> of this line segment
     * @param p2
     * the end <code>Point2D</code> of this line segment
     * @since 1.2
     */
    public constructor(p1: Point2D, p2: Point2D);

    /**
     * Constructs and initializes a <code>Line2D</code> from the specified
     * coordinates.
     *
     * @param x1
     * the X coordinate of the start point
     * @param y1
     * the Y coordinate of the start point
     * @param x2
     * the X coordinate of the end point
     * @param y2
     * the Y coordinate of the end point
     * @since 1.2
     */
    public constructor(x1: double, y1: double, x2: double, y2: double);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 0: {

                break;
            }

            case 2: {
                const [p1, p2] = args as [Point2D, Point2D];

                this.setLine(p1, p2);

                break;
            }

            case 4: {
                const [x1, y1, x2, y2] = args as [double, double, double, double];

                this.setLine(x1, y1, x2, y2);

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getX1(): double {
        return this.x1;
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getY1(): double {
        return this.y1;
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getP1(): Point2D {
        return new Point2D(this.x1, this.y1);
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getX2(): double {
        return this.x2;
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getY2(): double {
        return this.y2;
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getP2(): Point2D {
        return new Point2D(this.x2, this.y2);
    }

    /**
     * {@inheritDoc}
     *
     * @since 1.2
     */
    public getBounds2D(): Rectangle2D {
        let x: double = 0;
        let y: double = 0;
        let w: double = 0;
        let h: double = 0;
        if (this.x1 < this.x2) {
            x = this.x1;
            w = this.x2 - this.x1;
        } else {
            x = this.x2;
            w = this.x1 - this.x2;
        }
        if (this.y1 < this.y2) {
            y = this.y1;
            h = this.y2 - this.y1;
        } else {
            y = this.y2;
            h = this.y1 - this.y2;
        }
        return new Rectangle2D(x, y, w, h);
    }
    /*
     * JDK 1.6 serialVersionUID
     */
    private static readonly serialVersionUID: number = 0;//long = 7979627399746467499n;

    /**
     * Sets the location of the end points of this <code>Line2D</code> to the
     * same as those end points of the specified <code>Line2D</code>.
     *
     * @param l
     * the specified <code>Line2D</code>
     * @since 1.2
     */
    public setLine(l: Line2D): void;

    /**
     * Sets the location of the end points of this <code>Line2D</code> to the
     * specified <code>Point2D</code> coordinates.
     *
     * @param p1
     * the start <code>Point2D</code> of the line segment
     * @param p2
     * the end <code>Point2D</code> of the line segment
     * @since 1.2
     */
    public setLine(p1: Point2D, p2: Point2D): void;

    /**
     * Sets the location of the end points of this <code>Line2D</code> to the
     * specified double coordinates.
     *
     * @param x1
     * the X coordinate of the start point
     * @param y1
     * the Y coordinate of the start point
     * @param x2
     * the X coordinate of the end point
     * @param y2
     * the Y coordinate of the end point
     * @since 1.2
     */
    public setLine(x1: double, y1: double, x2: double, y2: double): void;
    public setLine(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const [l] = args as [Line2D];


                this.setLine(l.getX1(), l.getY1(), l.getX2(), l.getY2());


                break;
            }

            case 2: {
                const [p1, p2] = args as [Point2D, Point2D];


                this.setLine(p1.getX(), p1.getY(), p2.getX(), p2.getY());


                break;
            }

            case 4: {
                const [x1, y1, x2, y2] = args as [double, double, double, double];
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Returns an indicator of where the specified point {@code (px,py)} lies
     * with respect to the line segment from {@code (x1,y1)} to {@code (x2,y2)}.
     * The return value can be either 1, -1, or 0 and indicates in which
     * direction the specified line must pivot around its first end point,
     * {@code (x1,y1)}, in order to point at the specified point {@code (px,py)}
     * .
     * <p>
     * A return value of 1 indicates that the line segment must turn in the
     * direction that takes the positive X axis towards the negative Y axis. In
     * the default coordinate system used by Java 2D, this direction is
     * counterclockwise.
     * <p>
     * A return value of -1 indicates that the line segment must turn in the
     * direction that takes the positive X axis towards the positive Y axis. In
     * the default coordinate system, this direction is clockwise.
     * <p>
     * A return value of 0 indicates that the point lies exactly on the line
     * segment. Note that an indicator value of 0 is rare and not useful for
     * determining colinearity because of floating point rounding issues.
     * <p>
     * If the point is colinear with the line segment, but not between the end
     * points, then the value will be -1 if the point lies "beyond {@code
     * (x1,y1)}" or 1 if the point lies "beyond {@code (x2,y2)}".
     *
     * @param x1
     * the X coordinate of the start point of the specified line
     * segment
     * @param y1
     * the Y coordinate of the start point of the specified line
     * segment
     * @param x2
     * the X coordinate of the end point of the specified line
     * segment
     * @param y2
     * the Y coordinate of the end point of the specified line
     * segment
     * @param px
     * the X coordinate of the specified point to be compared with
     * the specified line segment
     * @param py
     * the Y coordinate of the specified point to be compared with
     * the specified line segment
     * @return an integer that indicates the position of the third specified
     * coordinates with respect to the line segment formed by the first
     * two specified coordinates.
     * @since 1.2
     */
    public static relativeCCW(x1: double, y1: double, x2: double, y2: double,
        px: double, py: double): int {
        x2 -= x1;
        y2 -= y1;
        px -= x1;
        py -= y1;
        let ccw: double = px * y2 - py * x2;
        if (ccw === 0.0) {
            // The point is colinear, classify based on which side of
            // the segment the point falls on. We can calculate a
            // relative value using the projection of px,py onto the
            // segment - a negative value indicates the point projects
            // outside of the segment in the direction of the particular
            // endpoint used as the origin for the projection.
            ccw = px * x2 + py * y2;
            if (ccw > 0.0) {
                // Reverse the projection to be relative to the original x2,y2
                // x2 and y2 are simply negated.
                // px and py need to have (x2 - x1) or (y2 - y1) subtracted
                // from them (based on the original values)
                // Since we really want to get a positive answer when the
                // point is "beyond (x2,y2)", then we want to calculate
                // the inverse anyway - thus we leave x2 & y2 negated.
                px -= x2;
                py -= y2;
                ccw = px * x2 + py * y2;
                if (ccw < 0.0) {
                    ccw = 0.0;
                }
            }
        }
        return (ccw < 0.0) ? -1 : ((ccw > 0.0) ? 1 : 0);
    }

    /**
     * Returns an indicator of where the specified point {@code (px,py)} lies
     * with respect to this line segment. See the method comments of
     * {@link #relativeCCW(double, double, double, double, double, double)} to
     * interpret the return value.
     *
     * @param px
     * the X coordinate of the specified point to be compared with
     * this <code>Line2D</code>
     * @param py
     * the Y coordinate of the specified point to be compared with
     * this <code>Line2D</code>
     * @return an integer that indicates the position of the specified
     * coordinates with respect to this <code>Line2D</code>
     * @see #relativeCCW(double, double, double, double, double, double)
     * @since 1.2
     */
    public relativeCCW(px: double, py: double): int {
        return Line2D.relativeCCW(this.getX1(), this.getY1(), this.getX2(), this.getY2(), px, py);
    }

    /**
     * Returns the square of the distance from a point to a line. The distance
     * measured is the distance between the specified point and the closest
     * point on the infinitely-extended line defined by the specified
     * coordinates. If the specified point intersects the line, this method
     * returns 0.0.
     *
     * @param x1
     * the X coordinate of the start point of the specified line
     * @param y1
     * the Y coordinate of the start point of the specified line
     * @param x2
     * the X coordinate of the end point of the specified line
     * @param y2
     * the Y coordinate of the end point of the specified line
     * @param px
     * the X coordinate of the specified point being measured against
     * the specified line
     * @param py
     * the Y coordinate of the specified point being measured against
     * the specified line
     * @return a double value that is the square of the distance from the
     * specified point to the specified line.
     * @since 1.2
     */
    public static ptLineDistSq(x1: double, y1: double, x2: double,
        y2: double, px: double, py: double): double {
        // Adjust vectors relative to x1,y1
        // x2,y2 becomes relative vector from x1,y1 to end of segment
        x2 -= x1;
        y2 -= y1;
        // px,py becomes relative vector from x1,y1 to test point
        px -= x1;
        py -= y1;
        let dotprod: double = px * x2 + py * y2;
        // dotprod is the length of the px,py vector
        // projected on the x1,y1=>x2,y2 vector times the
        // length of the x1,y1=>x2,y2 vector
        let projlenSq: double = dotprod * dotprod / (x2 * x2 + y2 * y2);
        // Distance to line is now the length of the relative point
        // vector minus the length of its projection onto the line
        let lenSq: double = px * px + py * py - projlenSq;
        if (lenSq < 0) {
            lenSq = 0;
        }
        return lenSq;
    }

    /**
     * Returns the distance from a point to a line. The distance measured is the
     * distance between the specified point and the closest point on the
     * infinitely-extended line defined by the specified coordinates. If the
     * specified point intersects the line, this method returns 0.0.
     *
     * @param x1
     * the X coordinate of the start point of the specified line
     * @param y1
     * the Y coordinate of the start point of the specified line
     * @param x2
     * the X coordinate of the end point of the specified line
     * @param y2
     * the Y coordinate of the end point of the specified line
     * @param px
     * the X coordinate of the specified point being measured against
     * the specified line
     * @param py
     * the Y coordinate of the specified point being measured against
     * the specified line
     * @return a double value that is the distance from the specified point to
     * the specified line.
     * @since 1.2
     */
    public static ptLineDist(x1: double, y1: double, x2: double, y2: double,
        px: double, py: double): double {
        return Math.sqrt(Line2D.ptLineDistSq(x1, y1, x2, y2, px, py));
    }

    /**
     * Returns the square of the distance from a specified <code>Point2D</code>
     * to this line. The distance measured is the distance between the specified
     * point and the closest point on the infinitely-extended line defined by
     * this <code>Line2D</code>. If the specified point intersects the line,
     * this method returns 0.0.
     *
     * @param pt
     * the specified <code>Point2D</code> being measured against this
     * line
     * @return a double value that is the square of the distance from a
     * specified <code>Point2D</code> to the current line.
     * @since 1.2
     */
    public ptLineDistSq(pt: Point2D): double;

    /**
     * Returns the square of the distance from a point to this line. The
     * distance measured is the distance between the specified point and the
     * closest point on the infinitely-extended line defined by this
     * <code>Line2D</code>. If the specified point intersects the line, this
     * method returns 0.0.
     *
     * @param px
     * the X coordinate of the specified point being measured against
     * this line
     * @param py
     * the Y coordinate of the specified point being measured against
     * this line
     * @return a double value that is the square of the distance from a
     * specified point to the current line.
     * @since 1.2
     */
    public ptLineDistSq(px: double, py: double): double;
    public ptLineDistSq(...args: unknown[]): double {
        switch (args.length) {
            case 1: {
                const [pt] = args as [Point2D];


                return Line2D.ptLineDistSq(this.getX1(), this.getY1(), this.getX2(), this.getY2(), pt.getX(), pt.getY());


                break;
            }

            case 2: {
                const [px, py] = args as [double, double];


                return Line2D.ptLineDistSq(this.getX1(), this.getY1(), this.getX2(), this.getY2(), px, py);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Returns the distance from a <code>Point2D</code> to this line. The
     * distance measured is the distance between the specified point and the
     * closest point on the infinitely-extended line defined by this
     * <code>Line2D</code>. If the specified point intersects the line, this
     * method returns 0.0.
     *
     * @param pt
     * the specified <code>Point2D</code> being measured
     * @return a double value that is the distance from a specified
     * <code>Point2D</code> to the current line.
     * @since 1.2
     */
    public ptLineDist(pt: Point2D): double;

    /**
     * Returns the distance from a point to this line. The distance measured is
     * the distance between the specified point and the closest point on the
     * infinitely-extended line defined by this <code>Line2D</code>. If the
     * specified point intersects the line, this method returns 0.0.
     *
     * @param px
     * the X coordinate of the specified point being measured against
     * this line
     * @param py
     * the Y coordinate of the specified point being measured against
     * this line
     * @return a double value that is the distance from a specified point to the
     * current line.
     * @since 1.2
     */
    public ptLineDist(px: double, py: double): double;
    public ptLineDist(...args: unknown[]): double {
        switch (args.length) {
            case 1: {
                const [pt] = args as [Point2D];


                return Line2D.ptLineDist(this.getX1(), this.getY1(), this.getX2(), this.getY2(), pt.getX(), pt.getY());


                break;
            }

            case 2: {
                const [px, py] = args as [double, double];


                return Line2D.ptLineDist(this.getX1(), this.getY1(), this.getX2(), this.getY2(), px, py);


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Tests if a given <code>Point2D</code> is inside the boundary of this
     * <code>Line2D</code>. This method is required to implement the
     * {@link Shape} interface, but in the case of <code>Line2D</code> objects
     * it always returns <code>false</code> since a line contains no area.
     *
     * @param p
     * the specified <code>Point2D</code> to be tested
     * @return <code>false</code> because a <code>Line2D</code> contains no
     * area.
     * @since 1.2
     */
    public contains(p: Point2D): boolean;

    /**
     * Tests if the interior of this <code>Line2D</code> entirely contains the
     * specified <code>Rectangle2D</code>. This method is required to implement
     * the <code>Shape</code> interface, but in the case of <code>Line2D</code>
     * objects it always returns <code>false</code> since a line contains no
     * area.
     *
     * @param r
     * the specified <code>Rectangle2D</code> to be tested
     * @return <code>false</code> because a <code>Line2D</code> contains no
     * area.
     * @since 1.2
     */
    public contains(r: Rectangle2D): boolean;

    /**
     * Tests if a specified coordinate is inside the boundary of this
     * <code>Line2D</code>. This method is required to implement the
     * {@link Shape} interface, but in the case of <code>Line2D</code> objects
     * it always returns <code>false</code> since a line contains no area.
     *
     * @param x
     * the X coordinate of the specified point to be tested
     * @param y
     * the Y coordinate of the specified point to be tested
     * @return <code>false</code> because a <code>Line2D</code> contains no
     * area.
     * @since 1.2
     */
    public contains(x: double, y: double): boolean;

    /**
     * Tests if the interior of this <code>Line2D</code> entirely contains the
     * specified set of rectangular coordinates. This method is required to
     * implement the <code>Shape</code> interface, but in the case of
     * <code>Line2D</code> objects it always returns false since a line contains
     * no area.
     *
     * @param x
     * the X coordinate of the upper-left corner of the specified
     * rectangular area
     * @param y
     * the Y coordinate of the upper-left corner of the specified
     * rectangular area
     * @param w
     * the width of the specified rectangular area
     * @param h
     * the height of the specified rectangular area
     * @return <code>false</code> because a <code>Line2D</code> contains no
     * area.
     * @since 1.2
     */
    public contains(x: double, y: double, w: double, h: double): boolean;
    public contains(...args: unknown[]): boolean {
        return false;
    }

    /**
     * Creates a new object of the same class as this object.
     *
     * @return a clone of this instance.
     * @exception OutOfMemoryError
     * if there is not enough memory.
     * @see java.lang.Cloneable
     * @since 1.2
     */
    public clone(): Line2D | null 
    {
        try {
            //return super.clone();
            throw Error("Need to implement clone for Line2D");
        } catch (e) {
            {
                // this shouldn't happen, since we are Cloneable
                throw Error("Need to implement clone for Line2D" + e.message);
            } 
        }
    }
}

