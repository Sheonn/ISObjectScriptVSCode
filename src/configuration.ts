import vscode = require('vscode');
const { workspace } = vscode;

export class Configuration {
    private _connection: Connection = new Connection(undefined);
    private _export: Export = new Export(undefined);
    private _autoCompile: boolean = false;
    private _workspaceRootPath: string | undefined;

    get Connection(): Connection { return this._connection; }
    get Export(): Export { return this._export; }
    get autoCompile(): boolean { return this._autoCompile; }
    get workspaceRootFolder(): string | undefined { return this._workspaceRootPath; }

    constructor() {
        const parameters = workspace.getConfiguration('isobjectscript');
        this.init(parameters);

        workspace.onDidChangeConfiguration(
            () => {
                console.log('configuration changed');
                const parameters = workspace.getConfiguration('isobjectscript');
                this.init(parameters);
            }
        );
    }

    private init(parameters: vscode.WorkspaceConfiguration | undefined): void {
        if (!parameters) { return; }
        this._connection = new Connection(parameters.get('connect'));
        this._export = new Export(parameters.get('export'));
        this._autoCompile = !!parameters.get<boolean>('autoCompile');
        this._workspaceRootPath = workspace.rootPath;
    }
}

class Connection {
    private _host: string = 'localhost';
    private _port: number = 80;
    private _ns: string = 'USER';
    private _username: string = '_SYSTEM';
    private _password: string = 'SYS';
    private _baseuri: string = '/api/atelier/';
    private _apiversion: string = 'v1';
    private _secure: boolean = false;

    constructor(parameters: vscode.WorkspaceConfiguration | undefined) {
        if (!parameters) { return; }
        this._host = parameters.host;
        this._port = parameters.port;
        this._ns = parameters.ns;
        this._username = parameters.username;
        this._password = parameters.password;
        this._baseuri = parameters.baseuri;
        this._apiversion = parameters.apiversion;
        this._secure = parameters.secure;
    }

    get host(): string { return this._host; }
    get port(): number { return this._port; }
    get namespace(): string { return this._ns; }
    get username(): string { return this._username; }
    get password(): string { return this._password; }
    get baseURI(): string { return this._baseuri; }
    get apiVersion(): string { return this._apiversion; }
    get secure(): boolean { return this._secure; }
}

class Export {
    private _folder: string = 'src';
    private _astree: boolean = true;
    private _category: Array<string> = ['*'];

    constructor(parameters: vscode.WorkspaceConfiguration | undefined) {
        if (!parameters) { return; }
        this._folder = parameters.folder;
        this._astree = parameters.astree;
        this._category = parameters.category.split(';');
    }

    get folder(): string { return this._folder; }
    get asTree(): boolean { return this._astree; }
    get category(): Array<string> { return this._category; }
}