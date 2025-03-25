/**
 *
 *
 */
export class RendererException extends Error {

    public constructor(message: string, cause: Error | null) {
        super(message);
    }

}
