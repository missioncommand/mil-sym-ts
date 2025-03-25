import { IIconRenderer } from "../renderer/IIconRenderer"

/**
 * this class managers all other iconRenderers
 * @deprecated
 */
export class IconRenderer {

	public constructor() {
	}

	public addRenderer(renderer: IIconRenderer): void {
	}

	public CanRender(symbolID: string, modifiers: Map<string, string>, rendererID: string): null {
		return null;
	}

	public RenderIcon(symbolID: string, modifiers: Map<string, string>, rendererID: string): null {
		return null;
	}
}
