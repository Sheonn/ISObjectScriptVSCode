import { Configuration } from '../configuration';
import * as rc from 'typed-rest-client/RestClient';
import * as hm from 'typed-rest-client/Handlers';
import * as ifm from 'typed-rest-client/Interfaces';

/*class RequestOptions implements ifm.IRequestOptions {
    constructor() {
        let options: rc.IRequestOptions = <rc.IRequestOptions>{};
        options.responseProcessor = (obj: any) => {
            return obj['data'];
        };
    }
}*/

export class AtelierAPI {

    private _restClient: rc.RestClient;
    private _apiVersion: string;
    constructor() {
        const config = new Configuration();
        const connectConfig = config.Connection;
        const requestHandler = new hm.BasicCredentialHandler(connectConfig.username, connectConfig.password);
        //const requestOptions = new rc.RestClient.RequestOptions();

        const baseUrl = connectConfig.secure ? 'https://' : 'http://' 
            + connectConfig.host 
            + ':' + connectConfig.port 
            + connectConfig.baseURI;

        this._apiVersion = connectConfig.apiVersion;
        this._restClient = new rc.RestClient('vscode-objectscript', baseUrl, [requestHandler]);
    }

    /**
     * This method returns information about the server, including Caché Source Code File REST API version and namespaces that are available on the server.
     * For an example and additional details refer to Getting Information about the Caché Server in the tutorial chapter of this manual. 
     * GET http://server:port/api/atelier/
     */
    public async getServer(): Promise<rc.IRestResponse<any>> {
        return await this._restClient.get('');
    }

    /**
     * This method returns the HttpHeader for the server.
     * HEAD http://server:port/api/atelier/
     */
    public async headServer() {
        return await this._restClient.client.head('');
    }

    /**
     * This method returns a list of running jobs on the Caché instance.
     * GET http://server:port/api/atelier/v1/%25SYS/jobs
     */
    public async getJobs(): Promise<rc.IRestResponse<any>> {
        return await this._restClient.get(`${this._apiVersion}/%25SYS/jobs`);
    }

    /**
     * This method returns the binary contents of the METADATA.zip file for the named database. Atelier uses this file to store index information so that it can preserve this information for future sessions.
     * GET http://server:port/api/atelier/v1/%25SYS/metadata/database
     * @param database 
     */
    public async getMetaData(database: string): Promise<rc.IRestResponse<any>> {
        return await this._restClient.get(`${this._apiVersion}/%25SYS/metadata/${database}`);
    }

    /**
     * This method returns a list of CSP applications defined on the server or defined for a specified namespace on the server.
     * GET http://server:port/api/atelier/v1/%25SYS/cspapps
     * GET http://server:port/api/atelier/v1/%25SYS/cspapps/namespace
     * URL Parameters:
     * The URL parameter ?detail=1 can be passed to return an array containing objects which describe the application in more detail.
     * @param namespace  - server namespace
     */
    public async getCSPApps(namespace?: string, detail?: boolean): Promise<rc.IRestResponse<any>> {
        let uri = `${this._apiVersion}/%25SYS/cspapps`;
        if (namespace !== undefined) {
            uri += `/${namespace}`;
        }
        return await this._restClient.get(`${uri}?detail=${detail ? 1 : 0}`);
    }

    /*
     * This method returns information about a specific namespace.
     * GET http://server:port/api/atelier/v1/namespace
     */
    public async getNamespace(namespace: string, detail?: boolean): Promise<rc.IRestResponse<any>> {
        return await this._restClient.get(`${this._apiVersion}/${namespace}`);
    }

    /**
     * This method returns a list of source code file names. The optional cat and type constrain the types of source code files. 
     * GET http://server:port/api/atelier/v1/namespace/docnames
     * GET http://server:port/api/atelier/v1/namespace/docnames/cat
     * GET http://server:port/api/atelier/v1/namespace/docnames/cat/type
     * @param category - Specifies a category code: CLS = class; RTN = routine; CSP = csp file; OTH = other. Default is *.
     * @param type - Specifies a source code file type. Can be an * wildcard or a three-letter code. 
     * For CLS, type must be *. For RTN, type may be mac, int, inc, bas ,mvi, or mvb. 
     * For CSP, type can be a list of file types such as js or css separated by commas. Default is *.
     * URL Parameters:
     * The URL parameter 'generated=1' specifies that generated source code files should be included.
     * The URL parameter 'filter' provides a SQL filter that can be used to match the names.
     */
    public async getDocNames(category: string, type?: string, generated?: boolean, filter?:string): Promise<rc.IRestResponse<any>> {
        const uri = `${this._apiVersion}/docnames/${category}?generated=${generated ? 1 : 0}&filter=${filter}`;
        return await this._restClient.get(uri);
    }

    /**
     * This method returns a list of source code files that have been modified since the time the databases had the specified hashes.
     * POST http://server:port/api/atelier/v1/namespace/modified/type
     * @param namespace - server namespace
     * @param type - Specifies a source code file type as * or a three-letter code, ls, mac, int, inc, bas, or mvi. Default is *.
     * @param data - List of source code files to check [ { "dbname" : "USER", "dbhash" : "KWAGbOdnRblPzANaiv1Oiu0BZLI" }, ... ]
     */
    public async getModifiedDocNames(namespace: string, type:string, data:Array<object>): Promise<rc.IRestResponse<any>> {
        return await this._restClient.create(`${this._apiVersion}/${namespace}/modified/${type}`, JSON.stringify(data));
    }

    /**
     * This method saves the supplied source code file.
     * PUT http://server:port/api/atelier/v1/namespace/doc/doc-name
     * @param namespace - server namespace
     * @param docname - document name
     * @param data - document content
     * URL Parameters: 
     * The URL parameter ?ignoreConflict=1 can be passed to bypass ETAG checking. 
     * This forces the source code file to be written to the server even if the file has changed since you previously accessed it. 
     */
    public async putDoc(namespace: string, docname:string, data:object): Promise<rc.IRestResponse<any>> {
        return await this._restClient.replace(`${this._apiVersion}/${namespace}/doc/${docname}`, JSON.stringify(data));
    }

    /**
     * This method returns the text for the named source code file and namespace.
     * GET http://server:port/api/atelier/v1/namespace/doc/doc-name
     * @param namespace - server namespace
     * @param docname - document name
     * URL Parameters:
     * The URL parameter ?binary=1 can be passed to force the source code file to be encoded as binary.
     * The URL parameter ?storageOnly=1 can be passed to return only the storage portion of a class.
     * In version 2, the URL parameter ?format= parameter can be passed to specify that the contents of the file should be returned in UDL format (the default),
     * XML format, or the format used by the legacy %RO export utility.
     * ?format=udl (xml, %RO)
     * If you specify ?binary=1, GetDoc ignores the format parameter.
     */
    public async getDoc(namespace: string, docname:string, binary:boolean = false, storage:boolean = false, format:string = 'udl'): Promise<rc.IRestResponse<any>> {
        const uri = `${this._apiVersion}/${namespace}/doc/${docname}?binary=${binary ? 1 : 0}&storageOnly=${storage ? 1 : 0}&format=${format}`;
        return await this._restClient.get(uri);
    }

    /**
     * This method deletes the named source code file in the specified namespace. It returns the corresponding source code file object.
     * DELETE http://server:port/api/atelier/v1/namespace/doc/doc-name
     * @param namespace - server namespace
     * @param docname - document name
     */
    public async deleteDoc(namespace: string, docname:string): Promise<rc.IRestResponse<any>> {
        return await this._restClient.del(`${this._apiVersion}/${namespace}/doc/${docname}`);
    }

    /**
    * This method returns the HttpHeader for the named source code file and namespace. 
     * This header contains a timestamp which can be used to detect discrepancies between server and client versions.
     * HEAD http://server:port/api/atelier/v1/namespace/doc/doc-name
     * @param namespace - server namespace
     * @param docname - document name
     * HTTP Return Codes
     * HTTP 200 if OK.
     * HTTP 400 if the resource name is an invalid source code file name.
     * HTTP 404 if the resource is not found.
     * HTTP 500 if an unexpected error occurred (details will be in status error array).
     */
    public async headDoc(namespace: string, docname:string) {
        return await this._restClient.client.head(`${this._apiVersion}/${namespace}/doc/${docname}`);
    }

    /**
     * This method returns the text for the all of the specified source code files in the namespace.
     * @param namespace - server namespace
     * @param listdoc - A list of source code files to be fetched is passed in the body of the http request [ "%Activate.Enum.cls", ... ]
     */
    public async getDocs(namespace: string, data: Array<object>): Promise<rc.IRestResponse<any>> {
        return await this._restClient.create(`${this._apiVersion}/${namespace}/docs`, JSON.stringify(data));
    }

    /**
     * This method deletes a list of named source code files. It returns a corresponding array of source code file objects.
     * DELETE http://server:port/api/atelier/v1/namespace/docs
     * @param namespace - server namespace
     * @param data - The list of files to delete is passed in the body of the http request as a JSON array. For example, [ "%Activate.Enum.cls", ... ].
     */
    public async deleteDocs(namespace: string, data: Array<object>): Promise<ifm.IHttpClientResponse> {
        const requestUrl = `${this._apiVersion}/${namespace}/docs`;
        return this._restClient.client.request('DELETE', requestUrl, JSON.stringify(data), {});
        //return this._restClient._processResponse(res, options);
        //return await this._restClient.client.del(`${this._apiVersion}/${namespace}/docs`, JSON.stringify(data));
    }

    /**
     * This method compiles source code files.
     * POST http://server:port/api/atelier/v1/namespace/action/compile
     * @param namespace - server namespace
     * @param data - The list of files to be compiled is passed in the body of the http request as a JSON array. For example, [ "%Activate.Enum.cls", ... ]
     * URL Parameters
     * The URL parameter 'flags' can be passed (default "cuk") which will be passed to the compiler.
     * The URL parameter 'source' can be passed with a value of 0 if you don't want the source of the compiled source code file to be returned.
     */
    public async compile(namespace: string, data: Array<object>): Promise<rc.IRestResponse<any>> {
        return await this._restClient.create(`${this._apiVersion}/${namespace}/action/compile`, JSON.stringify(data));
    }

    /**
     * This method returns summary information on the specified source code files.
     * POST http://server:port/api/atelier/v1/namespace/action/index
     * @param namespace - server namespace
     * @param data - The list of source code files to be indexed is passed in the body of the http request. For example, [ "%Activate.Enum.cls", ... ]
     */
    public async index(namespace: string, data: Array<object>): Promise<rc.IRestResponse<any>> {
        return await this._restClient.create(`${this._apiVersion}/${namespace}/action/index`, JSON.stringify(data));
    }

    /**
     * This method performs an SQL query on a Caché table and returns the results.
     * POST http://server:port/api/atelier/v1/namespace/action/query
     * @param namespace - server namespace
     * @param data - The SQL query is specified in the body of the URL request. The query must specify a database in the specified namespace.
     */
    public async query(namespace: string, data: string): Promise<rc.IRestResponse<any>> {
        return await this._restClient.create(`${this._apiVersion}/${namespace}/action/query`, data);
    }

    /**
     * This method finds files in the Caché database with the specified contents.
     * GET http://server:port/api/atelier/v2/namespace/action/search
     * @param namespace 
     * @param data 
     * URL Parameters
     * The required URL parameter ?query=expression specifies a regular expression or a text string to search for in the specified files. 
     * The required URL parameter ?files=file-list provides a comma-separated list of files or file masks, such as al*.mac, to search for the specified expression. 
     * The optional URL parameter ?regex=1 specifies that the query URL parameter contains a regular expression and is the default. ?regexp=0 specifies that the query contains a text string and should not be interpreted as a regular expression.
     * The optional URL parameter ?sys=1 specifies to include system files in the search. The default is ?sys=0, which excludes system files.
     * The optional URL parameter ?gen=1 specifies to include generated files in the search. The default is ?gen=0, which excludes generated files.
     * The optional URL parameter ?max=integer specifies the maximum number of results to return. The default is ?max=200. 
     * Example: GET localhost:57772/api/atelier/v2/SAMPLES/action/search?query=.*\sEmail\s.*&files=*.cls,*.mac
     */
    public async search(namespace: string, query: string, files: string, regex: boolean = false, sys: boolean = false, gen: boolean = false, max:number = 200): Promise<rc.IRestResponse<any>> {
        let uri = `${this._apiVersion}/${namespace}/action/search?query=${query}&files=${files}&regex=${regex ? 1 : 0}&sys=${sys ? 1 : 0}&gen=${gen ? 1 : 0}&max=${max}`;
        return await this._restClient.get(uri);
    }
}