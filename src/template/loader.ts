import type { IFileSystemHandler } from "src/fileSystem";
import nunjucks from "nunjucks";
import { default as nunjucks_date } from "nunjucks-date";
import Log from "../log";
import type { ITemplateType } from "./templateTypes";

export class TemplateLoader {
    private path: string;
    private fsHandler: IFileSystemHandler;
    private templateType: ITemplateType;
    private dateFilter;

    constructor(
        path: string,
        fsHandler: IFileSystemHandler,
        templateType: ITemplateType
    ) {
        this.path = path;
        this.fsHandler = fsHandler;
        this.templateType = templateType;
        this.dateFilter = nunjucks_date;

        this.dateFilter.setDefaultFormat("YYYY-MM-DD");
    }

    async load(): Promise<nunjucks.Template> {
        let content = await this.selectTemplate();

        let env = nunjucks.configure({
            autoescape: false,
        });

        this.dateFilter.install(env);

        return nunjucks.compile(content, env);
    }

    async selectTemplate(): Promise<string> {
        let content: string = this.templateType.defaultTemplate();

        if (this.path !== null && this.path !== "") {
            if (!this.path.endsWith(".md")) {
                this.path += ".md";
            }
            Log.debug(`Loading template content from ${this.path}`);
            content = await this.fsHandler.read(this.path);
        } else {
            Log.debug(`Using default ${this.templateType.type()}`);
        }

        return content;
    }
}
