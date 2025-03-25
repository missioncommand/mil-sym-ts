import { Point2D } from "../../graphics2d/Point2D";
import { Rectangle } from "../../renderer/shapes/rectangle";
import { ErrorLogger } from "../../renderer/utilities/ErrorLogger";
import { IPointConversion } from "../../renderer/utilities/IPointConversion";
import { RendererSettings } from "../../renderer/utilities/RendererSettings";
import { RendererUtilities } from "../../renderer/utilities/RendererUtilities";
import { ShapeInfo } from "../../renderer/utilities/ShapeInfo";
import { MultiPointHandler } from "./MultiPointHandler";
import { Path } from "../../renderer/shapes/path";
import { SVGTextInfo } from "../../renderer/utilities/SVGTextInfo";
import { Color } from "../../renderer/utilities/Color";

export class MultiPointHandlerSVG {
    /**
     * Generates an SVG which can be draped on a map.
     * Better with RenderSymbol2D
     * 
     * @param {string} id
     * @param {string} name
     * @param {string} description
     * @param {string} symbolID
     * @param {ShapeInfo[]} shapes 
     * @param {ShapeInfo[]} modifiers 
     * @param {IPointConversion} ipc
     * @param {boolean} normalize 
     * @param {string} textColor 
     * @param {string} textBackgroundColor
     * @param {boolean} wasClipped
     * @return {string}
     */
    public static GeoSVGize(id: string, name: string, description: string, symbolID: string, shapes: ShapeInfo[], modifiers: ShapeInfo[], ipc: IPointConversion, normalize: boolean, textColor: string, textBackgroundColor: string, wasClipped: boolean, bbox?: Rectangle): string {

        let height = 10;

        let tempBounds: Rectangle = null;
        let paths: string[] = [];
        let pathBounds: Rectangle = null;
        let labels: SVGTextInfo[] = [];
        let labelBounds: Rectangle = null;
        let unionBounds: Rectangle = null;
        let lineWidth: number = null;
        let fillTexture: string = null
        let geoCoordTL: Point2D = null;
        let geoCoordTR: Point2D = null;
        let geoCoordBL: Point2D = null;
        let geoCoordBR: Point2D = null;
        let west: Point2D = null;
        let north: Point2D = null;
        let south: Point2D = null;
        let east: Point2D = null;
        let len = shapes.length;

        try {
            const fontInfo = RendererSettings.getInstance().getMPLabelFont();
            height = fontInfo.getSize();

            for (let i = 0; i < len; i++) {
                let pathInfo = MultiPointHandlerSVG.ShapesToGeoSVG(symbolID, shapes[i], ipc, normalize);
                if (pathInfo.svg && pathInfo.bounds) {
                    tempBounds = pathInfo.bounds;
                    lineWidth = shapes[i].getStroke().getLineWidth()
                    tempBounds.grow(Math.round(lineWidth / 2));//adjust for line width so nothing gets clipped.
                    if (pathBounds == null)
                        pathBounds = tempBounds.clone();
                    else
                        pathBounds.union(tempBounds);
                    paths.push(pathInfo.svg);

                    if (pathInfo.fillPattern && !fillTexture)
                        fillTexture = pathInfo.fillPattern
                }
            }

            let tempModifier: ShapeInfo, len2 = modifiers.length;
            let tiTemp: SVGTextInfo = null;
            for (let j = 0; j < len2; j++) {
                tempModifier = modifiers[j];

                if (tempModifier.getModifierString()) {
                    let tempLocation: Point2D = tempModifier.getModifierPosition();

                    let justify = tempModifier.getTextJustify();
                    let strJustify = "start";
                    if (justify === ShapeInfo.justify_left)
                        strJustify = "start";
                    else if (justify === ShapeInfo.justify_center)
                        strJustify = "middle";
                    else if (justify === ShapeInfo.justify_right)
                        strJustify = "end";

                    let degrees = tempModifier.getModifierAngle();
                    tiTemp = new SVGTextInfo(tempModifier.getModifierString(), tempLocation, fontInfo, strJustify, degrees);

                    let bounds2D = tiTemp.getTextBounds();
                    let bounds = new Rectangle(bounds2D.x, bounds2D.y, bounds2D.width, bounds2D.height)

                    //make sure labels are in the bbox, otherwise they can
                    //make the canvas grow out of control.
                    //if (tiTemp && bbox.containsRectangle(bounds))
                    //if(bbox !== null)
                    if (tiTemp) {
                        if ((bbox && bbox.intersects(bounds)) || bbox == null) {
                            labels.push(tiTemp);
                            if (bounds) {
                                if (labelBounds)
                                    labelBounds.union(bounds);
                                else
                                    labelBounds = bounds;
                            }
                        }
                    }
                } else if (tempModifier.getModifierImageInfo()) {
                    let bounds2D = tempModifier.getModifierImageInfo().getImageBounds()
                    let bounds = new Rectangle(0, 0, bounds2D.width, bounds2D.height)

                    let tempLocation: Point2D = tempModifier.getModifierPosition();
                    tempLocation.setLocation(tempLocation.x - bounds.getWidth() / 2, tempLocation.y - bounds.getHeight() / 2);
                    let x = tempLocation.x
                    let y = tempLocation.y
                    bounds.setLocation(x, y)

                    let angle = tempModifier.getModifierAngle()
                    paths.push('<image transform="translate(' + x + ',' + y + ') rotate(' + angle + ')" href="' + tempModifier.getModifierImage() + '" />')
                    if (angle !== 0) {
                        bounds2D.x = tempLocation.x
                        bounds2D.y = tempLocation.y
                        bounds2D = SVGTextInfo.getRotatedRectangleBounds(bounds2D, tempLocation, -angle, "middle")
                        bounds = new Rectangle(bounds2D.x, bounds2D.y, bounds2D.width, bounds2D.height)
                    }
                    if (bounds) {
                        if ((bbox && bbox.intersects(bounds)) || bbox == null) {
                            if (pathBounds)
                                pathBounds.union(bounds);
                            else
                                pathBounds = bounds;
                        }
                    }
                }
            }
            if (pathBounds) {
                unionBounds = pathBounds.clone();
            }
            if (labelBounds) {
                if (unionBounds) {
                    unionBounds.union(labelBounds);
                }
                else {
                    unionBounds = labelBounds;
                }
            }

            //get geo bounds for canvas
            if (unionBounds) {
                let coordTL = new Point2D();
                coordTL.setLocation(unionBounds.getX(), unionBounds.getY());
                let coordBR = new Point2D();
                coordBR.setLocation(unionBounds.getX() + unionBounds.getWidth(), unionBounds.getY() + unionBounds.getHeight());

                let coordTR = new Point2D();
                coordTR.setLocation(unionBounds.getX() + unionBounds.getWidth(), unionBounds.getY());
                let coordBL = new Point2D();
                coordBL.setLocation(unionBounds.getX(), unionBounds.getY() + unionBounds.getHeight());

                south = new Point2D(unionBounds.getX() + unionBounds.getWidth() / 2, unionBounds.getY() + unionBounds.getHeight());
                north = new Point2D(unionBounds.getX() + unionBounds.getWidth() / 2, unionBounds.getY());
                east = new Point2D(unionBounds.getX() + unionBounds.getWidth(), unionBounds.getY() + unionBounds.getHeight() / 2);
                west = new Point2D(unionBounds.getX(), unionBounds.getY() + unionBounds.getHeight() / 2);


                geoCoordTL = ipc.PixelsToGeo(coordTL);
                geoCoordBR = ipc.PixelsToGeo(coordBR);
                geoCoordTR = ipc.PixelsToGeo(coordTR);
                geoCoordBL = ipc.PixelsToGeo(coordBL);

                north = ipc.PixelsToGeo(north);
                south = ipc.PixelsToGeo(south);
                east = ipc.PixelsToGeo(east);
                west = ipc.PixelsToGeo(west);


                if (normalize) {
                    geoCoordTL = MultiPointHandler.NormalizeCoordToGECoord(geoCoordTL);
                    geoCoordBR = MultiPointHandler.NormalizeCoordToGECoord(geoCoordBR);
                    geoCoordTR = MultiPointHandler.NormalizeCoordToGECoord(geoCoordTR);
                    geoCoordBL = MultiPointHandler.NormalizeCoordToGECoord(geoCoordBL);

                    north = MultiPointHandler.NormalizeCoordToGECoord(north);
                    south = MultiPointHandler.NormalizeCoordToGECoord(south);
                    east = MultiPointHandler.NormalizeCoordToGECoord(east);
                    west = MultiPointHandler.NormalizeCoordToGECoord(west);
                }
            }
            else//nothing to draw
            {
                geoCoordTL = new Point2D(0, 0);
                geoCoordBR = new Point2D(0, 0);
                geoCoordTR = new Point2D(0, 0);
                geoCoordBL = new Point2D(0, 0);

                north = new Point2D(0, 0);
                south = new Point2D(0, 0);
                east = new Point2D(0, 0);
                west = new Point2D(0, 0);
            }
        }
        catch (err) {
            ErrorLogger.LogException("MultiPointHandler", "GeoSVGize", err);
        }

        if (paths && len > 0 && unionBounds) {
            //create group with offset translation
            //ctx.translate(bounds.getX() * -1, bounds.getY() * -1);
            let group = '<g transform="translate(' + (unionBounds.getX() * -1) + ',' + (unionBounds.getY() * -1) + ')">';

            //loop through paths and labels and build SVG.
            for (let i = 0; i < paths.length; i++) {
                group += paths[i];
            }

            let labelStrs = this.renderTextElement(labels, textColor, textBackgroundColor);
            for (let j = 0; j < labelStrs.length; j++) {
                group += labelStrs[j];
            }
            //close
            group += '</g>';

            //wrap in SVG
            let geoSVG = '<svg width="' + Math.ceil(unionBounds.getWidth()) + 'px" height="' + Math.ceil(unionBounds.getHeight()) + 'px" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" version="1.1">';

            geoSVG += ("<metadata>\n");
            geoSVG += ("<id>") + id + ("</id>\n");
            geoSVG += ("<name>") + name + ("</name>\n");
            geoSVG += ("<description>") + description + ("</description>\n");
            geoSVG += ("<symbolID>") + symbolID + ("</symbolID>\n");
            geoSVG += ("<geoTL>") + geoCoordTL.getX() + " " + geoCoordTL.getY() + ("</geoTL>\n")
            geoSVG += ("<geoBR>") + geoCoordBR.getX() + " " + geoCoordBR.getY() + ("</geoBR>\n")
            geoSVG += ("<geoTR>") + geoCoordTR.getX() + " " + geoCoordTR.getY() + ("</geoTR>\n")
            geoSVG += ("<geoBL>") + geoCoordBL.getX() + " " + geoCoordBL.getY() + ("</geoBL>\n")
            geoSVG += ("<north>") + north.getY() + ("</north>\n")
            geoSVG += ("<south>") + south.getY() + ("</south>\n")
            geoSVG += ("<east>") + east.getX() + ("</east>\n")
            geoSVG += ("<west>") + west.getX() + ("</west>\n")
            geoSVG += ("<wasClipped>") + wasClipped + ("</wasClipped>\n")
            geoSVG += ("<width>") + unionBounds.getWidth() + ("</width>\n");
            geoSVG += ("<height>") + unionBounds.getHeight() + ("</height>\n");
            geoSVG += ("</metadata>\n");


            /*//Scale the image, commented out as I decided to alter scale in getReasonableScale rather than adjust after the fact.
            let tempWidth = Math.ceil(unionBounds.getWidth());
            let tempHeight = Math.ceil(unionBounds.getHeight());
            let quality = 1.0;
            let bigger = Math.max(tempWidth, tempHeight);
            let max = 1000;
            if(!converter)
            {
                if(bigger < max)
                {
                    if(bigger * 2 < max)
                    {
                        quality = 2;
                    }
                    else
                    {
                        quality = max / bigger;
                    }
                }
                else
                {
                    quality = 1;
                }
            }
            let geoSVG = '<svg viewBox="0 0 ' + tempWidth + ' ' + tempHeight + '"' + ' width="' + (tempWidth * quality) + 'px" height="' + (tempHeight * quality) + 'px" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" version="1.1">';//*/
            if (fillTexture)
                geoSVG += fillTexture;
            geoSVG += group;
            geoSVG += '</svg>';//*/

            return geoSVG;

        }
        else {
            //return blank 2x2 SVG
            return '<svg width="2px" height="2px" xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>'
        }
    }

    /**
    * @param {SVGTextInfo[]} tiArray
    * @param {string} color a hex string "#000000" 
    * @param {string} outlineColor a hex string "#000000"
    */
    static renderTextElement(tiArray: SVGTextInfo[], color: string, outlineColor: string): string[] {
        //ctx.lineCap = "butt";
        //ctx.lineJoin = "miter";
        //ctx.miterLimit = 3;
        /*ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.miterLimit = 3;*/
        let svgElements: string[] = []

        let size = tiArray.length,
            tempShape: SVGTextInfo = null,
            textColor = "#000000",
            tbm = RendererSettings.getInstance().getTextBackgroundMethod(),
            outlineWidth = RendererSettings.getInstance().getTextOutlineWidth();

        if (color) {
            textColor = color;
        }


        if (!outlineColor) {
            outlineColor = RendererUtilities.getIdealOutlineColor(new Color(textColor)).toHexString(false);
        }


        if (tbm === RendererSettings.TextBackgroundMethod_OUTLINE) {
            for (let i = 0; i < size; i++) {
                tempShape = tiArray[i];
                svgElements.push(tempShape.toSVGElement(textColor, outlineColor, outlineWidth));
            }
        }
        else if (tbm === RendererSettings.TextBackgroundMethod_OUTLINE_QUICK) {
            //TODO: need to update, this is regular outline approach
            for (let i = 0; i < size; i++) {
                tempShape = tiArray[i];
                svgElements.push(tempShape.toSVGElement(textColor, outlineColor, outlineWidth));
            }
        }
        else if (tbm === RendererSettings.TextBackgroundMethod_COLORFILL) {
            for (let i = 0; i < size; i++) {
                tempShape = tiArray[i];
                svgElements.push(tempShape.getTextOutlineBounds().toSVGElement(null, null, outlineColor));
                svgElements.push(tempShape.toSVGElement(textColor, null));
            }
        }
        else //if(tbm === RendererSettings.TextBackgroundMethod_NONE)
        {
            for (let j = 0; j < size; j++) {
                tempShape = tiArray[j];
                svgElements.push(tempShape.toSVGElement(textColor, null));
            }
        }

        return svgElements;
    }

    /**
     * @param {string} symbolID
     * @param {ShapeInfo} shapeInfo
     * @param {IPointConversion} ipc
     * @param {boolean} normalize
     * @returns {object} { svg: string, bounds: Rectangle, fillPattern: string }
     */
    static ShapesToGeoSVG(symbolID: string, shapeInfo: ShapeInfo, ipc: IPointConversion, normalize: boolean): { svg: string, bounds: Rectangle, fillPattern: string } {
        let path: Path = null;
        let fillColor: string = null;
        let lineColor: string = null;
        let lineWidth: number = null;
        let lineAlpha = 1.0;
        let fillAlpha = 1.0;
        let dashArray: number[] = null;
        let fillPattern: string = null;

        if (shapeInfo.getLineColor()) {
            let lineColorTemp = shapeInfo.getLineColor();
            lineAlpha = lineColorTemp.getAlpha() / 255;
            lineColor = lineColorTemp.toHexString(false);
        }
        if (shapeInfo.getFillColor()) {
            let fillColorTemp = shapeInfo.getFillColor();
            fillAlpha = fillColorTemp.getAlpha() / 255;
            fillColor = fillColorTemp.toHexString(false);
        }

        if (shapeInfo.getPatternFillImageInfo()) {
            let bounds = shapeInfo.getPatternFillImageInfo().getImageBounds();
            fillPattern = '<defs><pattern id="fillPattern" patternUnits="userSpaceOnUse" width="' + bounds.width + '" height="' + bounds.height + '"><image href="' + shapeInfo.getPatternFillImage() + '" /></pattern></defs>'
        }

        let stroke = shapeInfo.getStroke();
        if (stroke !== null) {
            lineWidth = Math.round(stroke.getLineWidth());
            dashArray = stroke.getDashArray();
        }

        let shapesArray = shapeInfo.getPolylines();
        path = new Path();
        if (dashArray)
            path.setLineDash(dashArray.toString());
        for (let i = 0; i < shapesArray.length; i++) {
            let shape = shapesArray[i];

            for (let j = 0; j < shape.length; j++) {
                let coord = shape[j];
                if (j === 0) {
                    path.moveTo(coord.x, coord.y);
                } else if (dashArray) {
                    path.dashedLineTo(coord.x, coord.y, dashArray);
                } else {
                    path.lineTo(coord.x, coord.y);
                }
            }
        }
        if (fillPattern)
            fillColor = "url(#fillPattern)";
        let svgElement = path.toSVGElement(lineColor, lineWidth, fillColor, lineAlpha, fillAlpha);
        let svgInfo = { svg: svgElement, bounds: path.getBounds(), fillPattern: fillPattern };
        return svgInfo;
    }
}