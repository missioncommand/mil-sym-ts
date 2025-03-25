import { DrawRules } from "../../renderer/utilities/DrawRules"
import { MODrawRules } from "../../renderer/utilities/MODrawRules"
import { MSLookup } from "../../renderer/utilities/MSLookup"
import { SymbolID } from "../../renderer/utilities/SymbolID"


/**
 * This class holds information about the MilStd Symbol.
 * Name, geometry, point count, Draw Rule, etc...
 * Can be retrived from {@link MSLookup}.
 */
export class MSInfo {

    private _Version: number = 0;
    private _Name: string;
    private _Path: string;
    private _SymbolSet: string;

    private _SymbolSetInt: number = 0;
    private _EntityCode: string;
    private _Geometry: string = "point";
    private _Modifiers: Array<string>;
    private _MinPointCount: number = 0;
    private _MaxPointCount: number = 0;
    private _DrawRule: number = 0;

    /**
     * @param version SymbolID.Version_2525Dch1 (11), SymbolID.Version_2525E (13)
     * @param symbolSet the 5th &amp; 6th character in the symbol Code, represents Battle Dimension
     * @param entity descriptor
     * @param entityType descriptor
     * @param entitySubType  descriptor
     * @param entityCode characters 11 - 16 in the symbol code
     * @param modifiers String[] of modifier codes
     */
    public constructor(version: number, symbolSet: string, entity: string, entityType: string, entitySubType: string, entityCode: string, modifiers: Array<string>);

    /**
     * @param version SymbolID.Version_2525Dch1 (11), SymbolID.Version_2525E (13)
     * @param symbolSet the 5th &amp; 6th character in the symbol Code, represents Battle Dimension
     * @param entity descriptor
     * @param entityType descriptor
     * @param entitySubType  descriptor
     * @param entityCode characters 11 - 16 in the symbol code
     * @param geometry "point", "line", "area"
     * @param drawRule as defined in 2525D for Control Measures and METOC (i.e. "Point1")
     * @param modifiers ArrayList of modifiers that are allowed for this symbol
     */
    public constructor(version: number, symbolSet: string, entity: string, entityType: string, entitySubType: string, entityCode: string, geometry: string, drawRule: string, modifiers: Array<string>);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 7: {
                const [version, symbolSet, entity, entityType, entitySubType, entityCode, modifiers] = args as [number, string, string, string, string, string, Array<string>];
                this._Version = version;
                this._SymbolSetInt = parseInt(symbolSet);
                this._SymbolSet = MSInfo.parseSymbolSetName(symbolSet, this._Version);
                if (entitySubType != null && entitySubType !== "") {
                    this._Name = entitySubType;
                    this._Path = this._SymbolSet + " / " + entity + " / " + entityType + " / ";
                }
                if (entityType != null && entityType !== "") {
                    if (this._Name == null) {
                        this._Name = entityType;
                    }

                    if (this._Path == null) {

                        this._Path = this._SymbolSet + " / " + entity + " / ";
                    }

                }
                if (entity != null && entity !== "") {
                    if (this._Name == null) {

                        this._Name = entity;
                    }

                    if (this._Path == null) {

                        this._Path = this._SymbolSet + " / ";
                    }

                }
                if (entityCode != null && entityCode.length === 6) {

                    this._EntityCode = entityCode;
                }


                this._Geometry = "point";

                //Only Control Measures and METOC categories have draw rules so everything else shows up in here if we
                //here if we don't check for them.
                if (entityCode !== "000000" &&
                    !(this._SymbolSetInt === SymbolID.SymbolSet_ControlMeasure ||
                        this._SymbolSetInt === SymbolID.SymbolSet_Atmospheric ||
                        this._SymbolSetInt === SymbolID.SymbolSet_Oceanographic ||
                        this._SymbolSetInt === SymbolID.SymbolSet_MeteorologicalSpace)) {
                    this._DrawRule = DrawRules.POINT2;
                    this._MinPointCount = 1;
                    this._MaxPointCount = 1;
                }


                this._Modifiers = modifiers;
                /*if(getSymbolSetInt() != SymbolID.SymbolSet_ControlMeasure)
                {//values come from files during MSLookup load for Control Measures
                    _Modifiers = populateModifierListD();
                }*/


                break;
            }

            case 9: {
                const [version, symbolSet, entity, entityType, entitySubType, entityCode, geometry, drawRule, modifiers] = args as [number, string, string, string, string, string, string, string, Array<string>];
                this._Version = version;
                this._SymbolSetInt = parseInt(symbolSet);
                this._SymbolSet = MSInfo.parseSymbolSetName(symbolSet, this._Version);
                if (entitySubType != null && entitySubType !== "") {
                    this._Name = entitySubType;
                    this._Path = this._SymbolSet + " / " + entity + " / " + entityType + " / ";
                }
                if (entityType != null && entityType !== "") {
                    if (this._Name == null) {
                        this._Name = entityType;
                    }

                    if (this._Path == null) {
                        this._Path = this._SymbolSet + " / " + entity + " / ";
                    }

                }
                if (entity != null && entity !== "") {
                    if (this._Name == null) {
                        this._Name = entity;
                    }

                    if (this._Path == null) {
                        this._Path = this._SymbolSet + " / ";
                    }

                }
                if (entityCode != null && entityCode.length === 6) {
                    this._EntityCode = entityCode;
                }

                this._Geometry = geometry;

                this._DrawRule = this.parseDrawRule(drawRule);

                let pointCounts: number[] = [0, 0];
                if (symbolSet === "25") {
                    pointCounts = MSInfo.getMinMaxPointsFromDrawRule(this._DrawRule, version);
                }
                else if (symbolSet === "45" || symbolSet === "46") {//Atmospheric, Oceanographic, Meteorological Space (last one has no symbols so not included)
                    pointCounts = MSInfo.getMinMaxPointsFromMODrawRule(this._DrawRule);
                }

                this._MinPointCount = pointCounts[0];
                this._MaxPointCount = pointCounts[1];

                this._Modifiers = modifiers;

                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    private parseDrawRule(drawRule: string): number {
        let dr: string = drawRule.toLowerCase();
        let idr: number = 0;
        switch (dr) {
            case "area1": {
                idr = DrawRules.AREA1;
                break;
            }

            case "area2": {
                idr = DrawRules.AREA2;
                break;
            }

            case "area3": {
                idr = DrawRules.AREA3;
                break;
            }

            case "area4": {
                idr = DrawRules.AREA4;
                break;
            }

            case "area5": {
                idr = DrawRules.AREA5;
                break;
            }

            case "area6": {
                idr = DrawRules.AREA6;
                break;
            }

            case "area7": {
                idr = DrawRules.AREA7;
                break;
            }

            case "area8": {
                idr = DrawRules.AREA8;
                break;
            }

            case "area9": {
                idr = DrawRules.AREA9;
                break;
            }

            case "area10": {
                idr = DrawRules.AREA10;
                break;
            }

            case "area11": {
                idr = DrawRules.AREA11;
                break;
            }

            case "area12": {
                idr = DrawRules.AREA12;
                break;
            }

            case "area13": {
                idr = DrawRules.AREA13;
                break;
            }

            case "area14": {
                idr = DrawRules.AREA14;
                break;
            }

            case "area15": {
                idr = DrawRules.AREA15;
                break;
            }

            case "area16": {
                idr = DrawRules.AREA16;
                break;
            }

            case "area17": {
                idr = DrawRules.AREA17;
                break;
            }

            case "area18": {
                idr = DrawRules.AREA18;
                break;
            }

            case "area19": {
                idr = DrawRules.AREA19;
                break;
            }

            case "area20": {
                idr = DrawRules.AREA20;
                break;
            }

            case "area21": {
                idr = DrawRules.AREA21;
                break;
            }

            case "area22": {
                idr = DrawRules.AREA22;
                break;
            }

            case "area23": {
                idr = DrawRules.AREA23;
                break;
            }

            case "area24": {
                idr = DrawRules.AREA24;
                break;
            }

            case "area25": {
                idr = DrawRules.AREA25;
                break;
            }

            case "area26": {
                idr = DrawRules.AREA26;
                break;
            }

            case "point1": {
                idr = DrawRules.POINT1;
                break;
            }

            case "point2": {
                idr = DrawRules.POINT2;
                break;
            }

            case "point3": {
                idr = DrawRules.POINT3;
                break;
            }

            case "point4": {
                idr = DrawRules.POINT4;
                break;
            }

            case "point5": {
                idr = DrawRules.POINT5;
                break;
            }

            case "point6": {
                idr = DrawRules.POINT6;
                break;
            }

            case "point7": {
                idr = DrawRules.POINT7;
                break;
            }

            case "point8": {
                idr = DrawRules.POINT8;
                break;
            }

            case "point9": {
                idr = DrawRules.POINT9;
                break;
            }

            case "point10": {
                idr = DrawRules.POINT10;
                break;
            }

            case "point11": {
                idr = DrawRules.POINT11;
                break;
            }

            case "point12": {
                idr = DrawRules.POINT12;
                break;
            }

            case "point13": {
                idr = DrawRules.POINT13;
                break;
            }

            case "point14": {
                idr = DrawRules.POINT14;
                break;
            }

            case "point15": {
                idr = DrawRules.POINT15;
                break;
            }

            case "point16": {
                idr = DrawRules.POINT16;
                break;
            }

            case "point17": {
                idr = DrawRules.POINT17;
                break;
            }

            case "point18": {
                idr = DrawRules.POINT18;
                break;
            }

            case "line1": {
                idr = DrawRules.LINE1;
                break;
            }

            case "line2": {
                idr = DrawRules.LINE2;
                break;
            }

            case "line3": {
                idr = DrawRules.LINE3;
                break;
            }

            case "line4": {
                idr = DrawRules.LINE4;
                break;
            }

            case "line5": {
                idr = DrawRules.LINE5;
                break;
            }

            case "line6": {
                idr = DrawRules.LINE6;
                break;
            }

            case "line7": {
                idr = DrawRules.LINE7;
                break;
            }

            case "line8": {
                idr = DrawRules.LINE8;
                break;
            }

            case "line9": {
                idr = DrawRules.LINE9;
                break;
            }

            case "line10": {
                idr = DrawRules.LINE10;
                break;
            }

            case "line11": {
                idr = DrawRules.LINE11;
                break;
            }

            case "line12": {
                idr = DrawRules.LINE12;
                break;
            }

            case "line13": {
                idr = DrawRules.LINE13;
                break;
            }

            case "line14": {
                idr = DrawRules.LINE14;
                break;
            }

            case "line15": {
                idr = DrawRules.LINE15;
                break;
            }

            case "line16": {
                idr = DrawRules.LINE16;
                break;
            }

            case "line17": {
                idr = DrawRules.LINE17;
                break;
            }

            case "line18": {
                idr = DrawRules.LINE18;
                break;
            }

            case "line19": {
                idr = DrawRules.LINE19;
                break;
            }

            case "line20": {
                idr = DrawRules.LINE20;
                break;
            }

            case "line21": {
                idr = DrawRules.LINE21;
                break;
            }

            case "line22": {
                idr = DrawRules.LINE22;
                break;
            }

            case "line23": {
                idr = DrawRules.LINE23;
                break;
            }

            case "line24": {
                idr = DrawRules.LINE24;
                break;
            }

            case "line25": {
                idr = DrawRules.LINE25;
                break;
            }

            case "line26": {
                idr = DrawRules.LINE26;
                break;
            }

            case "line27": {
                idr = DrawRules.LINE27;
                break;
            }

            case "line28": {
                idr = DrawRules.LINE28;
                break;
            }

            case "line29": {
                idr = DrawRules.LINE29;
                break;
            }

            case "corridor1": {
                idr = DrawRules.CORRIDOR1;
                break;
            }

            case "axis1": {
                idr = DrawRules.AXIS1;
                break;
            }

            case "axis2": {
                idr = DrawRules.AXIS2;
                break;
            }

            case "polyline1": {
                idr = DrawRules.POLYLINE1;
                break;
            }

            case "ellipse1": {
                idr = DrawRules.ELLIPSE1;
                break;
            }

            case "rectangular1": {
                idr = DrawRules.RECTANGULAR1;
                break;
            }

            case "rectangular2": {
                idr = DrawRules.RECTANGULAR2;
                break;
            }

            case "rectangular3": {
                idr = DrawRules.RECTANGULAR3;
                break;
            }

            case "circular1": {
                idr = DrawRules.CIRCULAR1;
                break;
            }

            case "circular2": {
                idr = DrawRules.CIRCULAR2;
                break;
            }

            case "arc1": {
                idr = DrawRules.ARC1;
                break;
            }
            case "":
            default: {
                idr = DrawRules.DONOTDRAW;
            }

        }
        return idr;
    }

    public static parseSymbolSetName(symbolID: string): string;
    public static parseSymbolSetName(ss: string, version: number): string;
    public static parseSymbolSetName(...args: unknown[]): string {
        switch (args.length) {
            case 1: {
                const [symbolID] = args as [string];


                return MSInfo.parseSymbolSetName(symbolID.substring(4, 6), SymbolID.getVersion(symbolID));


                break;
            }

            case 2: {
                const [ss, version] = args as [string, number];


                let name: string;
                switch (ss) {
                    case "01": {
                        name = "Air";
                        break;
                    }

                    case "02": {
                        name = "Air Missile";
                        break;
                    }

                    case "05": {
                        name = "Space";
                        break;
                    }

                    case "06": {
                        name = "Space Missile";
                        break;
                    }

                    case "10": {
                        name = "Land Unit";
                        break;
                    }

                    case "11": {
                        name = "Land Civilian Unit-Org";
                        break;
                    }

                    case "15": {
                        name = "Land Equipment";
                        break;
                    }

                    case "20": {
                        name = "Land Installations";
                        break;
                    }

                    case "25": {
                        name = "Control Measure";
                        break;
                    }

                    case "27": {
                        name = "Dismounted Individuals";
                        break;
                    }

                    case "30": {
                        name = "Sea Surface";
                        break;
                    }

                    case "35": {
                        name = "Sea Subsurface";
                        break;
                    }

                    case "36": {
                        name = "Mine Warfare";
                        break;
                    }

                    case "40": {
                        name = "Activities";
                        break;
                    }

                    case "45": {
                        name = "Atmospheric";
                        break;
                    }

                    case "46": {
                        name = "Oceanographic";
                        break;
                    }

                    case "47": {
                        name = "Meteorological Space";
                        break;
                    }

                    case "50": {
                        if (version < SymbolID.Version_2525E) {

                            name = "Space SIGINT";
                        }

                        else {

                            name = "SIGINT";
                        }

                        break;
                    }

                    case "51": {
                        name = "Air SIGINT";
                        break;
                    }

                    case "52": {
                        name = "Land SIGINT";
                        break;
                    }

                    case "53": {
                        name = "Sea Surface SIGINT";
                        break;
                    }

                    case "54": {
                        name = "Sea Subsurface SIGINT";
                        break;
                    }

                    case "60": {
                        name = "Cyberspace";
                        break;
                    }

                    default: {
                        name = "UNKNOWN";
                    }

                }
                return name;


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     *
     * @param drawRule - Like DrawRules.CIRCULAR2
     * @return int[] where the first index is the minimum required points and
     * the next index is the maximum allowed points
     */
    private static getMinMaxPointsFromDrawRule(drawRule: number, version: number): number[] {
        let points: number[] = [1, 1];

        switch (drawRule) {
            case DrawRules.AREA1:
            case DrawRules.AREA2:
            case DrawRules.AREA3:
            case DrawRules.AREA4:
            case DrawRules.AREA9:
            case DrawRules.AREA20:
            case DrawRules.AREA23: {
                points[0] = 3;
                points[1] = Number.MAX_VALUE;
                break;
            }

            case DrawRules.AREA5:
            case DrawRules.AREA7:
            case DrawRules.AREA11:
            case DrawRules.AREA12:
            case DrawRules.AREA14:
            case DrawRules.AREA17:
            case DrawRules.AREA21:
            case DrawRules.AREA24:
            case DrawRules.AREA25:
            case DrawRules.POINT12:
            case DrawRules.LINE3:
            case DrawRules.LINE6://doesn't seem to be used
            case DrawRules.LINE10:
            case DrawRules.LINE12:
            case DrawRules.LINE15:
            case DrawRules.LINE17:
            case DrawRules.LINE22:
            case DrawRules.LINE23:
            case DrawRules.LINE24:
            case DrawRules.LINE29://Ambush
            case DrawRules.POLYLINE1: {
                points[0] = 3;
                points[1] = 3;
                break;
            }

            case DrawRules.AREA6:
            case DrawRules.AREA13:
            case DrawRules.AREA15:
            case DrawRules.AREA16:
            case DrawRules.AREA19:
            case DrawRules.LINE4:
            case DrawRules.LINE5:
            case DrawRules.LINE9:
            case DrawRules.LINE14:
            case DrawRules.LINE18:
            case DrawRules.LINE19:
            case DrawRules.LINE20:
            case DrawRules.LINE25:
            case DrawRules.LINE28:
            case DrawRules.RECTANGULAR1://requires AM
            case DrawRules.RECTANGULAR3: {//requires AM
                points[0] = 2;
                points[1] = 2;
                break;
            }

            case DrawRules.AREA8:
            case DrawRules.AREA18:
            case DrawRules.LINE11:
            case DrawRules.LINE16: {
                points[0] = 4;
                points[1] = 4;
                break;
            }

            case DrawRules.AREA10: {
                points[0] = 3;
                points[1] = 6;
                break;
            }

            case DrawRules.LINE1:
            case DrawRules.LINE2:
            case DrawRules.LINE7:
            case DrawRules.LINE13:
            case DrawRules.LINE21:
            case DrawRules.CORRIDOR1: {//Airspace Control Corridors
                points[0] = 2;
                points[1] = Number.MAX_VALUE;
                break;
            }

            case DrawRules.AREA26: {
                //Min 6, no Max but number of points has to be even
                points[0] = 6;
                points[1] = Number.MAX_VALUE;
                break;
            }

            case DrawRules.LINE8: {
                points[0] = 2;
                points[1] = 300;
                break;
            }

            case DrawRules.LINE26:
            case DrawRules.LINE27: {
                if (version >= SymbolID.Version_2525E) {

                    points[0] = 4;
                }

                else {

                    points[0] = 3;
                }

                points[1] = 4;
                break;
            }

            case DrawRules.AXIS1:
            case DrawRules.AXIS2: {
                points[0] = 3;
                points[1] = 50;
                break;
            }

            case 0: {//do not draw
                points[0] = 0;
                points[1] = 0;
                break;
            }

            //Rest are single points
            case DrawRules.AREA22://Basic Defense Zone (BDZ) requires AM for radius
            case DrawRules.POINT17://requires AM & AM1
            case DrawRules.POINT18://requires AM & AN values
            case DrawRules.ELLIPSE1://required AM, AM1, AN
            case DrawRules.RECTANGULAR2://requires AM, AM1, AN
            default:
        }

        return points;
    }

    private static getMinMaxPointsFromMODrawRule(drawRule: number): number[] {
        let points: number[] = [1, 1];

        switch (drawRule) {
            case MODrawRules.AREA1:
            case MODrawRules.AREA2:
            case MODrawRules.LINE5: {
                points[0] = 3;
                points[1] = Number.MAX_VALUE;
                break;
            }

            case MODrawRules.POINT5:
            case MODrawRules.LINE1:
            case MODrawRules.LINE2:
            case MODrawRules.LINE3:
            case MODrawRules.LINE4:
            case MODrawRules.LINE6:
            case MODrawRules.LINE7:
            case MODrawRules.LINE8: {
                points[0] = 2;
                points[1] = Number.MAX_VALUE;
                break;
            }

            case 0: {//do not draw
                points[0] = 0;
                points[1] = 0;
                break;
            }

            //Rest are single points
            default:

        }

        return points;
    }

    public getVersion(): number {
        return this._Version;
    }

    public getName(): string {
        return this._Name;
    }

    public getPath(): string {
        return this._Path;
    }

    public getGeometry(): string {
        return this._Geometry;
    }

    public getDrawRule(): number {
        return this._DrawRule;
    }

    public getSymbolSet(): number {
        return this._SymbolSetInt;
    }

    public getEntityCode(): number {
        return Number.parseInt(this._EntityCode);
    }

    public getBasicSymbolID(): string 
    {
        if(this._SymbolSetInt < 10)
            return "0" + this._SymbolSetInt + this._EntityCode;
        else
            return "" + this._SymbolSetInt + this._EntityCode;
    }

    public getMinPointCount(): number {
        return this._MinPointCount;
    }

    public getMaxPointCount(): number {
        return this._MaxPointCount;
    }

    public getModifiers(): Array<string> {
        return this._Modifiers;
    }


}
