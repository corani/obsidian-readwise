import type { Document } from './api/models';
import Log from "./log";
import type { IFileSystemHandler } from './fileSystem';
import type { HeaderTemplateRenderer, HighlightTemplateRenderer } from "./template";

export class FileDoc {

    doc: Document;
    headerRenderer: HeaderTemplateRenderer
    highlightRenderer: HighlightTemplateRenderer
    fsHandler: IFileSystemHandler

    constructor(doc: Document, header: HeaderTemplateRenderer, highlight: HighlightTemplateRenderer, handler: IFileSystemHandler) {
        this.doc = doc;
        this.headerRenderer = header;
        this.highlightRenderer = highlight;
        this.fsHandler = handler;
    }

    public async createOrUpdate(storagePath: string) {
        const file = this.fsHandler.normalizePath(this.preparePath(storagePath));

        var content = '';

        if (!(await this.fsHandler.exists(file))) {
            Log.debug(`Document ${file} not found. Will be created`);

            content = await this.headerRenderer.render(this.doc);
        }
        else {
            Log.debug(`Document ${file} found. Loading content and updating highlights`);
            content = await this.fsHandler.read(file);
        }

        this.doc.highlights.forEach(hl => {
            Log.debug(`Writing highlight ${hl.id}`);
            if (!content.includes(`highlight_id: ${hl.id}`)) {
                // NOTE(daniel): if an insert point exists, insert the new highlight just before it.
                // Otherwise append the new highlight at the end of the file.
                if (content.includes(`%% highlight_insert_point %%`)) {
                    content = content.replace(
                        `%% highlight_insert_point %%`, 
                        `${this.highlightRenderer.render(hl)}\n%% highlight_insert_point %%`
                    );
                } else {
                    content += `\n${this.highlightRenderer.render(hl)}\n`;
                }
            }
        });

        await this.fsHandler.write(file, content);
    }

    public preparePath(storagePath: string = ''): string {
        if (storagePath.length > 0 && storagePath.slice(-1) !== '/') {
            storagePath = storagePath + '/';
        }
        return `${storagePath}${this.sanitizeName()}.md`
    }

    public sanitizeName(): string {
        console.log(`Sanitizing ${this.doc.title}`);
        return this.doc.title
            .replace(/(http[s]?\:\/\/)/, '')
            .replace(/(\?.*)/, '') // Remove query params
            .replace(/\./g, '_')
            .replace(/[\/\\\:\|]/g, '-')
    }
}
