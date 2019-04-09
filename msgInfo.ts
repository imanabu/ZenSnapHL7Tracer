// import * as _ from "lodash/fp";

import lineReader = require("readline");

const j = {} as any;
const parse = (path: string) => {
    const lr = lineReader.createInterface({
        input: require("fs").createReadStream(path),
    });

    let lineNo = 0;
    let setId = "";
    lr.on("line", (line: string) => {
        lineNo++;
        if (lineNo === 1) {
            setId = line;
            j.fields = [];
        }
        if (lineNo > 2) {
            const k = {} as any;
            const s = line.split("\t");
            k.desc = !s[6] ? s[5] : s[6];
            k.dt = Number.parseInt(s[3], 10);
            k.len = Number.parseInt(s[1], 10);
            k.opt =  s[4];
            k.rp = !s[6] ? "" : s[5];
            j.fields.push(k);
        }
    });
    lr.on("close", () => {
        const js = JSON.stringify(j, null, 2);
        const js2 = `const ${setId} = ${js};`;
        console.log(js2);
    });
};

// parse("./segments/PID.txt");
// parse("./segments/PV1.txt");
// parse("./segments/PV2.txt");
parse("./segments/PD1.txt");
