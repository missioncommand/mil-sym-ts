import { type int } from "../../graphics2d/BasicTypes";

import { Font } from "../../graphics2d/Font"
import { FontRenderContext } from "../../graphics2d/FontRenderContext"
import { PathIterator } from "../../graphics2d/PathIterator"
import { IPathIterator } from "../../graphics2d/IPathIterator"
import { Point2D } from "../../graphics2d/Point2D"
import { Rectangle2D } from "../../graphics2d/Rectangle2D"
import { Shape } from "../../graphics2d/Shape"
import { RendererSettings } from "../../renderer/utilities/RendererSettings"
import { TextInfo } from "../../renderer/utilities/TextInfo"


export class Shape2SVG {

    /**
     *
     * @param shape like {@link Shape}
     * @param stroke like "#000000
     * @param fill like "#0000FF" or "none"
     * @param strokeWidth "#"
     * @param strokeOpacity "1.0"
     * @param fillOpacity "1.0"
     * @param dashArray "4 1 2 3"
     * @return
     */
    //public static Convert(shape: Shape, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string;
    public static Convert(textInfo: TextInfo, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string;
    public static Convert(text: string, x: int, y: int, font: Font, frc: FontRenderContext, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string;
    public static Convert(...args: unknown[]): string | null {
        switch (args.length) {
            /*case 7: {
                const [shape, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray] = args as [Shape, string, string, string, string, string, string];


                if (shape instanceof Path2D) {

                    return Shape2SVG.convertPath(shape as Path2D, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray);
                }

                else {
                    if (shape instanceof Rectangle2D) {

                        return Shape2SVG.convertRect(shape as Rectangle2D, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray);
                    }

                    else {

                        return null;
                    }

                }



                break;
            }//*/

            case 7: {
                const [textInfo, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray] = args as [TextInfo, string, string, string, string, string, string];

                let res: string = "";
                if (textInfo != null) {
                    let name: string = RendererSettings.getInstance().getLabelFont().getName() + ", sans-serif";//"SansSerif";
                    let size: string = RendererSettings.getInstance().getLabelFont().getSize().toString();
                    let weight: string;
                    let anchor: string;//"start";
                    let text: string = textInfo.getText();

                    text = text.replace(/\&/g,"&amp;");
                    text = text.replace(/\</g,"&lt;");
                    text = text.replace(/\</g,"&gt;");

                    let location: Point2D = new Point2D(textInfo.getLocation().getX(), textInfo.getLocation().getY());

                    if (textInfo.getLocation().getX() < 0) {
                        if (textInfo.getLocation().getX() + textInfo.getTextBounds().getWidth() > 0) {
                            anchor = "middle";
                            location.setLocation(textInfo.getTextBounds().getCenterX(), location.getY());
                        }
                        else {
                            anchor = "end";
                            location.setLocation(textInfo.getTextBounds().getMaxX(), location.getY());
                        }
                    }

                    if (RendererSettings.getInstance().getLabelFont().isBold()) {

                        weight = "bold";
                    }


                    res += "<text x=\"" + location.getX() + "\" y=\"" + location.getY() + "\"";

                    if (anchor != null) {

                        res += " text-anchor=\"" + anchor + "\"";
                    }

                    res += " font-family=\"" + name + '"';
                    res += " font-size=\"" + size + "px\"";
                    if (weight != null) {

                        res += " font-weight=\"" + weight + "\"";
                    }

                    res += " alignment-baseline=\"alphabetic\"";//
                    res += " stroke-miterlimit=\"3\"";

                    //sb.append(" text-anchor=\"" + anchor + "\"");//always start for single points and default SVG behavior

                    /*if(this._angle)
                    {
                        se += ' transform="rotate(' + this._angle + ' ' + this._anchor.getX() + ' ' + this._anchor.getY() + ')"';
                    }*/

                    let seStroke: string = "";
                    let seFill: string = "";

                    if (stroke != null) {
                        seStroke = res.toString();

                        seStroke += " stroke=\"" + stroke + "\"";
                        /*else
                            seStroke = se + ' stroke="' + stroke.replace(/#/g,"&#35;") + '"';*/

                        if (strokeWidth != null) {

                            seStroke += " stroke-width=\"" + strokeWidth + "\"";
                        }

                        seStroke += " fill=\"none\"";
                        seStroke += ">";
                        seStroke += text;
                        seStroke += "</text>";
                    }

                    if (fill != null) {
                        seFill = res.toString();

                        seFill += " fill=\"" + fill + "\"";
                        seFill += ">";
                        seFill += text;
                        seFill += "</text>";
                    }

                    res = "";
                    if (stroke != null && fill != null) {
                        res += seStroke + "\n" + seFill + ("\n");
                    } else if (fill != null) {
                        res += seFill;
                    } else {
                        return null;
                    }

                    return res;
                }
                return null;
            }

            case 11: {
                const [text, x, y, font, frc, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray] = args as [string, int, int, Font, OffscreenCanvasRenderingContext2D, string, string, string, string, string, string];


                //(String text, int x, int y, Font font, FontRenderContext frc)
                let textInfo: TextInfo = new TextInfo(text, x, y, font, frc);
                return Shape2SVG.Convert(textInfo, stroke, fill, strokeWidth, strokeOpacity, fillOpacity, dashArray);
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Assumes common font properties will be defined in the group.
     * @param textInfo
     * @param stroke
     * @param fill
     * @param strokeWidth
     * @param strokeOpacity
     * @param fillOpacity
     * @param dashArray
     * @return
     */
    public static ConvertForGroup(textInfo: TextInfo, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string | null {
        let res: string = "";
        if (textInfo != null) {
            let anchor: string;//"start";
            let text: string = textInfo.getText();

            text = text.replace(/\&/g,"&amp;");
            text = text.replace(/\</g,"&lt;");
            text = text.replace(/\</g,"&gt;");

            let location: Point2D = new Point2D(textInfo.getLocation().getX(), textInfo.getLocation().getY());

            if (textInfo.getLocation().getX() < 0) {
                if (textInfo.getLocation().getX() + textInfo.getTextBounds().getWidth() > 0) {
                    anchor = "middle";
                    location.setLocation(textInfo.getTextBounds().getCenterX(), location.getY());
                } else {
                    anchor = "end";
                    location.setLocation(textInfo.getTextBounds().getMaxX(), location.getY());
                }
            }



            res += "<text x=\"" + location.getX() + "\" y=\"" + location.getY() + "\"";

            if (anchor != null) {
                res += " text-anchor=\"" + anchor + "\"";
            }


            //sb.append(" text-anchor=\"" + anchor + "\"");//always start for single points and default SVG behavior

            /*if(this._angle)
            {
                se += ' transform="rotate(' + this._angle + ' ' + this._anchor.getX() + ' ' + this._anchor.getY() + ')"';
            }*/

            let seStroke: string = "";
            let seFill: string = "";

            if (stroke != null) {
                seStroke = res.toString();

                seStroke += " stroke=\"" + stroke + "\"";
                /*else
                    seStroke = se + ' stroke="' + stroke.replace(/#/g,"&#35;") + '"';*/

                if (strokeWidth != null) {
                    seStroke += " stroke-width=\"" + strokeWidth + "\"";
                }

                seStroke += " fill=\"none\"";
                seStroke += ">";
                seStroke += text;
                seStroke += "</text>";
            }

            if (fill != null) {
                seFill = res.toString();


                seFill += " fill=\"" + fill + "\"";
                seFill += ">";
                seFill += text;
                seFill += "</text>";
            }

            res = "";
            if (stroke != null && fill != null) {
                res += seStroke + "\n" + seFill + "\n";
            } else if (fill != null) {
                res += seFill;
            } else {

                return null;
            }

            return res;
        }
        return null;
    }

    public static makeBase64Safe(svg: string): string | null {
        if (svg != null) {
            //Base64 encoding
            //return new String(Base64.getEncoder().encode(svg.getBytes()));
            //URL-safe Base64 encoding
            return btoa(svg);
        }
        else {
            return null;
        }

    }


    /**
     *
     * @param path2D like {@link Path2D}
     * @param stroke like "#000000
     * @param fill like "#0000FF" or "none"
     * @param strokeWidth "#"
     * @param strokeOpacity "1.0"
     * @param fillOpacity "1.0"
     * @param dashArray "4 1 2 3"
     * @return
     */
    private static convertPath(path2D: Path2D, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string 
    {
        return null;
        /*
        let coords: number[] = new Array<number>(6);
        let path: string = "";
        let line: string = "";
        let moveTo: Point2D;
        let windingRule: int = IPathIterator.WIND_EVEN_ODD;
        let format: int = 1;

        let pitr: PathIterator = path2D.getPathIterator(null);
        windingRule = pitr.getWindingRule();
        do {
            let type: int = pitr.currentSegment(coords);
            if (type === IPathIterator.SEG_LINETO) {
                path += "L" + coords[0] + " " + coords[1];
            } else if (type === IPathIterator.SEG_MOVETO) {
                path += "M" + coords[0] + " " + coords[1];
            } else if (type === IPathIterator.SEG_QUADTO) {
                path += "Q" + coords[0] + " " + coords[1] + " " + coords[2] + " " + coords[3];
            } else if (type === IPathIterator.SEG_CUBICTO) {
                path += "C" + coords[0] + " " + coords[1] + " " + coords[2] + " " + coords[3] + " " + coords[4] + " " + coords[5];
            } else if (type === IPathIterator.SEG_CLOSE) {
                path += "Z";
            }

            pitr.next();
        } while (!pitr.isDone());

        line += "<path d=\"" + path + "\"";

        if (stroke != null) {
            if (format === 2) {
                line += " stroke=\"" + stroke.replace("#", "%23") + "\"";
            } else {
                line += " stroke=\"" + stroke + "\"";
            }


            if (strokeWidth != null) {
                line += " stroke-width=\"" + strokeWidth + "\"";
            } else {

                line += " stroke-width=\"2\"";
            }


            if (strokeOpacity != null && strokeOpacity !== "1.0") {
                line += " stroke-opacity=\"" + strokeOpacity + "\"";
            }

            //sbLine.append(" stroke-linecap=\"round\"");

            if (dashArray != null) {
                line += " stroke-dasharray=\"" + dashArray + "\"";
            }


            if (fill != null) {
                if (format === 2) {
                    line += " fill=\"" + fill.replace("#", "%23") + "\"";
                } else {
                    line += " fill=\"" + fill + "\"";
                }

                if (fillOpacity != null && fillOpacity !== "1.0") {
                    line += " fill-opacity=\"" + fillOpacity + "\"";
                }
            }
            else {
                line += " fill=\"none\"";
            }

            line += " />";
        }
        return line;//*/
    }

    private static convertRect(rect: Rectangle2D, stroke: string, fill: string, strokeWidth: string, strokeOpacity: string, fillOpacity: string, dashArray: string): string | null {
        let res: string = "";
        if (rect != null && rect.isEmpty() !== true) {
            res += "<rect x=\"" + rect.getX() + "\" y=\"" + rect.getY();
            res += "\" width=\"" + rect.getWidth() + "\" height=\"" + rect.getHeight() + "\"";

            if (stroke != null) {
                res += " stroke=\"" + stroke + "\"";

                if (strokeWidth != null) {
                    res += " stroke-width=\"" + strokeWidth + "\"";
                } else {
                    res += " stroke-width=\"2\"";
                }
            }

            if (fill != null) {
                res += " fill=\"" + fill + "\"";
            } else {
                res += " fill=\"none\"";
            }

            res += "/>";
            return res;
        }
        else {
            return null;
        }
    }
}
