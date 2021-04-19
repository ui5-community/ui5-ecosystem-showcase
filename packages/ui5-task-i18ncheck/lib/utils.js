const xmldom = require('xmldom');

//SECTION:READ FILES

let readProperties = (file_content) => {

    let lines = file_content.split(/\r?\n/);

    let properties = {};


    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith("#")) {
            continue;
        }
        let arr = line.split('=');
        if (arr.length != 2) {
            continue;
        }
        let key = arr[0].trim();
        let val = arr[1].trim();
        properties[key] = val;
    }
    return properties;

}


// Node Types
let NodeType = {}
let ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
// let ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
// let TEXT_NODE = NodeType.TEXT_NODE = 3;
// let CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
// let ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
// let ENTITY_NODE = NodeType.ENTITY_NODE = 6;
// let PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
// let COMMENT_NODE = NodeType.COMMENT_NODE = 8;
// let DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
// let DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
// let DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
// let NOTATION_NODE = NodeType.NOTATION_NODE = 12;

let readI18nUsageFromXML = (file_content, file_path) => {
    // return new Promise<any[]>((resolve, reject) => {

    let doc = new xmldom.DOMParser().parseFromString(file_content);
    let docEl = doc.documentElement;
    let arr = [];
    getI18nUsageInXMLRecursive(arr, file_path, docEl)
    return arr;
    // resolve(arr);
    // })

}


let getUsageFromXMLAttribute = (file, attributeString) => {
    let regex = RegExp('(\{i18n>[^}]*\})', 'g');
    //let str1 = 'table {i18n>test}football, {i18n>test2}foosball';
    let arrayTemp = [];
    let resultArr = [];
    while ((arrayTemp = regex.exec(attributeString)) !== null) {
        let i18nUsage = {
            file: file,
            value: arrayTemp[0].substring(6, arrayTemp[0].length - 1)
        }
        resultArr.push(i18nUsage);
    }
    return resultArr;
}

//let i18nUsage = {file:"",value:""}
//arr: any[], file: any, el: { nodeType: number; attributes: string | any[]; childNodes: string | any[]; }
let getI18nUsageInXMLRecursive = (arr, file, el) => {
    if (el.nodeType != ELEMENT_NODE) {
        return;
    }

    for (let i = 0; i < el.attributes.length; i++) {
        let attr = el.attributes[i];
        let results = getUsageFromXMLAttribute(file, attr.value);
        arr.push(...results);

    }
    //search children
    for (let i = 0; i < el.childNodes.length; i++) {
        let childEl = el.childNodes[i]
        getI18nUsageInXMLRecursive(arr, file, childEl)
    }

}

//SECTION:COMPARE
//as: { size: any; length: number; }, bs: any
let eqSet = (as, bs) => {
    if (as.size !== bs.size) return false;
    //for (let a of as)
    for (let i = 0; i < as.length; i++) {
        let a = bs[i];
        if (!bs.has(a)) return false;
    }
    return true;
}

//takes i18nAll, returns array of grouped i18n
//[ { key: 'buttonAcceptText',
//    usedIn: Set { './testdata/Allowance.view.xml' } },

// groupedI18n: { i18nArr: any[]; usedInSet: any; }[]
// arr: any[]
let prepareSetArr = (groupedI18n, arr) => {

    if (arr.length == 0) {
        return groupedI18n;
    }
    //take one
    let splicedArr = arr.splice(arr.length - 1, 1);
    let splicedI18n = splicedArr[0];

    let setOfI18n = {
        i18nArr: [splicedI18n.key],
        usedInSet: splicedI18n.usedIn
    }

    for (let i = arr.length - 1; i > 0; i--) {

        if (eqSet(setOfI18n.usedInSet, arr[i].usedIn)) {

            setOfI18n.i18nArr.push(arr[i].key);
            arr.splice(i, 1);
        }
    }
    groupedI18n.push(setOfI18n);
    prepareSetArr(groupedI18n, arr);
}

module.exports.readProperties = readProperties
module.exports.readI18nUsageFromXML = readI18nUsageFromXML