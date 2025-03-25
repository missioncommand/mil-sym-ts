import { Point2D } from "../graphics2d/Point2D";
import { Rectangle2D } from "../graphics2d/Rectangle2D";
import { TacticalLines } from "../JavaLineArray/TacticalLines"
import { TGLight } from "../JavaTacticalRenderer/TGLight"
import { Color } from "../renderer/utilities/Color"
import { clsUtility } from "../RenderMultipoints/clsUtility";
import { RendererUtilities } from "./utilities/RendererUtilities";
import { SVGSymbolInfo } from "./utilities/SVGSymbolInfo";

/**
 * Created by michael.spinelli on 8/23/2017.
 */
export class PatternFillRenderer {
    private static readonly svgBeachSlopeModerate = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" >'
        + '<circle cx="15" cy="15" r="3" stroke="#CCCCCC" fill="#CCCCCC" stroke-width="1"/>'
        + '</svg>';
    private static readonly svgBeachSlopeSteep = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" >'
        + '<circle cx="15" cy="15" r="3" stroke="#CCCCCC" fill="#CCCCCC" stroke-width="1"/>'
        + '</svg>';
    private static readonly svgFoulGround = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="200" >'
        + '<text x="0" y="50" fill="#808080" stroke="#808080" font-family="sans-serif" font-size="60">#</text>'
        + '<text x="100" y="150" fill="#808080" stroke="#808080" font-family="sans-serif" font-size="60">#</text>'
        + '</svg>';
    private static readonly svgKelp = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="250" >'
        + '<g id="kelp1" transform="scale(0.25 0.25)">'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M186.5,121.5c22.973-20.676,49.014-39.547,80-46c37.059-7.719,81.906,7.875,108-28"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M262.277,76.832c-43.969-7.328-80.516-35.457-105.445-76"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M197.5,47.5c-50.059-5.008-102.018,38.008-142,62"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M135.832,61.391c-52.047,0-87.924-24.668-135.332-38.891"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M46.5,38.5c0,0-22.5,15.75-30,21"/>'
        + '</g>'
        + '<g id="kelp2" transform="scale(0.25 0.25)">'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M586.5,621.5c22.973-20.676,49.016-39.547,80-46c37.059-7.719,81.906,7.875,108-28"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M662.277,576.832c-43.969-7.328-80.516-35.457-105.445-76"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M597.5,547.5c-50.059-5.008-102.016,38.008-142,62"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M535.832,561.391c-52.047,0-87.926-24.668-135.332-38.891"/>'
        + '<path fill="none" stroke="#808080" stroke-width="8" d="M446.5,538.5c0,0-22.5,15.75-30,21"/>'
        + '</g>'
        + '</svg>';
    private static readonly svgRigField = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="50" height="50" >'
        + '<circle fill="#C0C0C0" cx="25" cy="24" r="10"/>'
        + '</svg>';
    private static readonly svgSweptArea = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="150" height="150" >'
        + '<circle fill="#FF00FF" cx="19" cy="19" r="19"/>'
        + '<circle fill="#FF00FF" cx="94" cy="94" r="19"/>'
        + '</svg>';
    private static readonly svgWeirs = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="124" height="104">'
        + '<g id="trap1">'
        + '<rect x="1" y="21" fill="none" stroke="#C0C0C0" stroke-width="2" width="60" height="30"/>'
        + '<line fill="none" stroke="#C0C0C0" stroke-width="2" x1="11" y1="1" x2="31" y2="21"/>'
        + '</g>'
        + '<g id="trap2">'
        + '<rect x="63" y="73" fill="none" stroke="#C0C0C0" stroke-width="2" width="60" height="30"/>'
        + '<line fill="none" stroke="#C0C0C0" stroke-width="2" x1="73" y1="53" x2="93" y2="73"/>'
        + '</g>'
        + '</svg>';

    /**
     * @param hatchStyle Direction of hatch lines - constants from clsUtility
     * @param spacing horizontal spacing between lines
     * @param strokeWidth width of lines
     * @param color Color of lines
     */
    public static MakeHatchPatternFill(hatchStyle: number, spacing: number, strokeWidth: number, color: Color): SVGSymbolInfo {
        let x1: number, x2: number;
        if (hatchStyle == clsUtility.Hatch_ForwardDiagonal) {
            x1 = spacing + strokeWidth;
            x2 = -strokeWidth;
        } else if (hatchStyle == clsUtility.Hatch_BackwardDiagonal) {
            x1 = -strokeWidth;
            x2 = spacing + strokeWidth;
        } else {
            return null;
        }

        const colorStr = RendererUtilities.colorToHexString(color, false);

        /*
         * SVG is a square with 3 diagonal lines going through it. All lines have the same slope x values
         * The middle line goes through both corners and the other lines are offset in y by +/- boxLength
         * Each line extends past the box to confirm the line fills each of the 4 corners
         */
        const hatchFillSVGString = "<svg width=\"" + spacing + "\" height=\"" + spacing + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">" +
            "<line id=\"middle_line\" stroke=\"" + colorStr + "\" stroke-width=\"" + strokeWidth + "\" x1=\"" + x1 + "\" x2=\"" + x2 + "\" y1=\"" + (spacing + strokeWidth) + "\" y2=\"" + (-strokeWidth) + "\"/>" +
            "<line id=\"bottom_line\" stroke=\"" + colorStr + "\" stroke-width=\"" + strokeWidth + "\" x1=\"" + x1 + "\" x2=\"" + x2 + "\" y1=\"" + (spacing * 2 + strokeWidth) + "\" y2=\"" + (spacing - strokeWidth) + "\"/>" +
            "<line id=\"top_line\" stroke=\"" + colorStr + "\" stroke-width=\"" + strokeWidth + "\" x1=\"" + x1 + "\" x2=\"" + x2 + "\" y1=\"" + strokeWidth + "\" y2=\"" + (-spacing - strokeWidth) + "\"/>" +
            "</svg>";

        const anchorPoint = new Point2D(spacing / 2, spacing / 2);
        const bounds = new Rectangle2D(spacing / 2, spacing / 2, spacing, spacing);
        return new SVGSymbolInfo(hatchFillSVGString, anchorPoint, bounds, bounds);
    }

    public static MakeMetocPatternFill(tg: TGLight): SVGSymbolInfo {
        let width = 0, height = 0;
        let svgFill = "";
        switch (tg.get_LineType()) {
            case TacticalLines.BEACH_SLOPE_MODERATE: {
                width = 30;
                height = 30;
                svgFill = PatternFillRenderer.svgBeachSlopeModerate;
                break;
            }
            case TacticalLines.BEACH_SLOPE_STEEP: {
                width = 30;
                height = 30;
                svgFill = PatternFillRenderer.svgBeachSlopeSteep;
                break;
            }
            case TacticalLines.FOUL_GROUND: {
                width = 200;
                height = 200;
                svgFill = PatternFillRenderer.svgFoulGround;
                break;
            }
            case TacticalLines.KELP: {
                width = 200;
                height = 250;
                svgFill = PatternFillRenderer.svgKelp;
                break;
            }
            case TacticalLines.OIL_RIG_FIELD: {
                width = 50;
                height = 50;
                svgFill = PatternFillRenderer.svgRigField;
                break;
            }
            case TacticalLines.SWEPT_AREA: {
                width = 150;
                height = 150;
                svgFill = PatternFillRenderer.svgSweptArea;
                break;
            }
            case TacticalLines.FISH_TRAPS: {
                width = 124;
                height = 104;
                svgFill = PatternFillRenderer.svgWeirs;
                break;
            }
        }

        const anchorPoint = new Point2D(width / 2, height / 2);
        const bounds = new Rectangle2D(width / 2, height / 2, width, height);
        return new SVGSymbolInfo(svgFill, anchorPoint, bounds, bounds);
    }
}
