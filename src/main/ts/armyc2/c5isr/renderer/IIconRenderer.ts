import { ImageInfo } from "../renderer/utilities/ImageInfo"

/**
 *
 * @deprecated
 */
export interface IIconRenderer {

	CanRender(symbolID: string, modifiers: Map<string, string>): boolean;

	RenderIcon(symbolID: string, modifiers: Map<string, string>): ImageInfo;

	getRendererID(): string;

}
