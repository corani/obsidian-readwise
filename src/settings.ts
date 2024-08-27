export interface ObsidianReadwiseSettings {
    syncOnBoot: boolean;
    autoSyncInterval: number;
    lastUpdate: number;
	disableNotifications: boolean;
    headerTemplatePath: string;
    highlightStoragePath: string;
    highlightTemplatePath: string;
    authorsMappingFilename: string;
    titlesMappingFilename: string;
    apiServer: string;
}

export class ObsidianReadwiseSettingsGenerator {

    static withData(data: any): ObsidianReadwiseSettings {
        return Object.assign({}, ObsidianReadwiseSettingsGenerator.defaultSettings(), data);
    }

    static defaultSettings(): ObsidianReadwiseSettings {
        return {
            syncOnBoot: false,
            autoSyncInterval: 0,
            disableNotifications: false,
            headerTemplatePath: "",
            highlightTemplatePath: "",
            highlightStoragePath: "",
            authorsMappingFilename: "authors.json",
            titlesMappingFilename: "titles.json",
            apiServer: "https://readwise.io",
            lastUpdate: Date.now()
        }
    }
}
