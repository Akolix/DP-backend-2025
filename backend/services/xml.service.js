import { Builder, parseStringPromise } from 'xml2js';

export function convertToXml(data) {
    const builder = new Builder({
        rootName: 'food',
        headless: false,
        renderOpts: { pretty: true }
    });
    return builder.buildObject(data);
}

export async function validateXml(xmlString) {
    try {
        await parseStringPromise(xmlString);
        return true;
    } catch (error) {
        throw new Error(`Invalid XML: ${error.message}`);
    }
}