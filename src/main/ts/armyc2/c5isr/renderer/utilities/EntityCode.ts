
export class EntityCode {
    public static readonly EntityCode_FLOT: number = 140100;

    public static readonly EntityCode_BioContaminatedArea: number = 271700;
    public static readonly EntityCode_BioContaminatedAreaToxic: number = 271701;

    public static readonly EntityCode_ChemContaminatedArea: number = 271800;
    public static readonly EntityCode_ChemContaminatedAreaToxic: number = 271801;

    public static readonly EntityCode_NuclearContaminatedArea: number = 271900;
    public static readonly EntityCode_RadiologicalContaminatedArea: number = 272000;
    public static readonly EntityCode_RadiologicalContaminatedAreaToxic: number = 272001;


    public static readonly EntityCode_BioEvent: number = 281400;
    public static readonly EntityCode_BioEvent_Toxic: number = 281401;

    public static readonly EntityCode_ChemicalEvent: number = 281300;
    public static readonly EntityCode_ChemicalEvent_Toxic: number = 281301;

    public static readonly EntityCode_NuclearEvent: number = 281500;

    public static readonly EntityCode_RadiologicalEvent: number = 281700;
    public static readonly EntityCode_RadiologicalEvent_Toxic: number = 281701;

    public static readonly EntityCode_AnchoragePoint: number = 120304;

    public static readonly EntityCode_Decision_Point: number = 130700;

    /**
     * Returns the modifier icon for a given contamination area
     * @param contaminationArea the entity code of the contamination area
     * @return the entity code of the icon that should be displayed within it
     */
    public static getSymbolForContaminationArea(contaminationArea: number): number {
        switch (contaminationArea) {
            case EntityCode.EntityCode_BioContaminatedArea:
                return EntityCode.EntityCode_BioEvent;
            case EntityCode.EntityCode_BioContaminatedAreaToxic:
                return EntityCode.EntityCode_BioEvent_Toxic;

            case EntityCode.EntityCode_ChemContaminatedArea:
                return EntityCode.EntityCode_ChemicalEvent;
            case EntityCode.EntityCode_ChemContaminatedAreaToxic:
                return EntityCode.EntityCode_ChemicalEvent_Toxic;

            case EntityCode.EntityCode_NuclearContaminatedArea:
                return EntityCode.EntityCode_NuclearEvent;

            case EntityCode.EntityCode_RadiologicalContaminatedArea:
                return EntityCode.EntityCode_RadiologicalEvent;

            case EntityCode.EntityCode_RadiologicalContaminatedAreaToxic:
                return EntityCode.EntityCode_RadiologicalEvent_Toxic;

            default: {
                return -1;
            }
        }
    }
}
