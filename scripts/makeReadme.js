const fs = require("fs");
const path = require("path");
const json2md = require("json2md");


const TARGET_PATH = "../data";
const DEFAULT_README_PATH = "./default-readme.md";

const CorpInfoKeys = ["official", "name", "nodeDeveloperRate", "nodeProjectRate", "frameworks", "link", "remoteWork", "army"];
const CorpInfoKeysKr = ["공식 여부", "회사명", "NodeJS/BE 개발자 비율", "NodeJS 프로젝트 비율", "사용 프레임워크", "채용 링크", "원격 근무", "병역 특례"];

/**
 * 정렬 방식
 * SORT BY official DESC, nodeDeveloperRate DESC, nodeProjectRate DESC
 * 
 * @param {*} files 
 * @param {*} targetPath 
 * @returns 
 */
function getCorpInfosFromFiles(files, targetPath = TARGET_PATH) {
    return files.map(file => {
        if (path.extname(file) === ".json") {
            const filePath = path.join(targetPath, file);

            try {
                const readFile = fs.readFileSync(filePath, "utf8");
                const corpInfo = JSON.parse(readFile);

                return {
                    name: corpInfo.name,
                    link: corpInfo.link,
                    army: corpInfo.army.join(','),
                    official: corpInfo.official,
                    remoteWork: corpInfo.remoteWork,
                    frameworks: corpInfo.frameworks.join(','),
                    nodeProjectRate: corpInfo.nodeProjectRate || 0,
                    nodeDeveloperRate: corpInfo.nodeDeveloperRate  || 0,
                }
            } catch (error) {
                console.error(`${file}을 읽는 중 오류가 발생했습니다:`, error);
            }
        }
    }).sort(sortByCorpInfo);
}

function sortByCorpInfo(a,b){
    // official을 기준으로 내림차순 정렬
    if (b.official !== a.official) {
        return b.official - a.official;
    }

    // nodeDeveloperRate을 기준으로 내림차순 정렬
    if (b.nodeDeveloperRate !== a.nodeDeveloperRate) {
        return b.nodeDeveloperRate - a.nodeDeveloperRate;
    }

    // nodeProjectRate을 기준으로 내림차순 정렬
    return b.nodeProjectRate - a.nodeProjectRate;
}

function getDefaultReadme(path) {
    return fs.readFileSync(path, "utf8");
}

function convertCorpInfoToRow(corpInfo){
    return {
        name: corpInfo.name,
        link: corpInfo.link,
        army: corpInfo.army,
        official: corpInfo.official && `<img src="https://github.com/ejn-jimmy/node-backend-in-korea/assets/142366502/e5e8cf74-3c26-4705-b56c-97fb3c6e11bf" width="20" height="20"/>`,
        remoteWork: corpInfo.remoteWork ? 'O' : 'X',
        frameworks: corpInfo.frameworks,
        nodeProjectRate: corpInfo.nodeProjectRate === 0 ? '' : `${corpInfo.nodeProjectRate}%`,
        nodeDeveloperRate: corpInfo.nodeDeveloperRate === 0 ? '' : `${corpInfo.nodeDeveloperRate}%`,
    }
}

function getNewMarkdown(corpInfos) {
    const rows = corpInfos.map(convertCorpInfoToRow);
    let tableMarkdown = json2md({ table: { headers: CorpInfoKeys, rows } });
    tableMarkdown = tableMarkdown.replace(/[-]{2,}/g, match => ` :${match.trim()}:`);
    CorpInfoKeys.forEach((val, index) => {
        tableMarkdown = tableMarkdown.replace(val, CorpInfoKeysKr[index]);
    })


    const defaultReadme = getDefaultReadme(DEFAULT_README_PATH);
    return defaultReadme.concat('\n', tableMarkdown);
}

function makeReadme() {
    const files = fs.readdirSync(TARGET_PATH);
    const corpInfos = getCorpInfosFromFiles(files);
    const newReadme = getNewMarkdown(corpInfos);

    fs.writeFile('../new-readme.md', newReadme, (err) => {
        if (err) {
            console.log('새로운 README 파일 생성 중 오류가 발생했습니다:', err);
            return;
        }

        console.log('README 생성이 완료되었습니다.');
    });
}

module.exports = makeReadme;
