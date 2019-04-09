import * as _ from "lodash/fp";

import lineReader = require("readline");

import pidDef = require("./pid");
import pv1Def = require("./pv1");
import pv2Def = require("./pv2");

import pd1Def = require("./pd1");

interface IFields {
    desc: string;
    dt: string;
    len: number;
    opt: string;
    rp: string;
}

interface IHl7Event {
    eventType: string;
    eventTime: Date;
    pid?: string[][];
    pidLine?: string;
    pv1Line?: string;
    pv2Line?: string;
    pd1Line?: string;
    obxLines: string[];
}

const hl7Dump = (v: IHl7Event) => {
    // console.log(`${v.eventType} at ${v.eventTime}`);

    const splitLog = (l: string): void => {
        const s = l.split("|");
        let fieldNames = [] as any[];
        const seg = s[0];
        switch (seg) {
            case "PID":
                fieldNames = pidDef.PID.fields;
                break;
            case "PV1":
                fieldNames = pv1Def.PV1.fields;
                break;
            case "PV2":
                fieldNames = pv2Def.PV2.fields;
                break;
            case "PD1":
                fieldNames = pd1Def.PD1.fields;
                break;
        }
        s.forEach((item, index) => {
            if (index === 0) {
                console.log(`++ ${seg} Segment ++`);
            } else if (item) {
                console.log(`   ${seg}-${index}: ${item} [${fieldNames[index - 1].desc}]`);
            }
        });
    };

    if (v.pidLine) {
        splitLog(v.pidLine);
    }
    if (v.pv1Line) {
        splitLog(v.pv1Line);
    }

    if (v.pv2Line) {
        splitLog(v.pv2Line);
    }

    if (v.pd1Line) {
        splitLog(v.pd1Line);
    }
};

const fieldDiff = (fieldsAny: any[], a?: string, b?: string): string => {
    const fields = fieldsAny as IFields[];
    if (a && !b) {
        return `Segment removed: ${a}\n`;
    }
    if (!a && b) {
        return `Segment added: ${b}\n`;
    }
    if (a && b && (a !== b)) {
        // return `Subfield Changed From:\n${a}\nTo:\n${b}`;
        const fieldA = a!.split("|");
        const fieldB = b!.split("|");
        fieldA.shift();
        fieldB.shift();

        let result = "";
        let i = 0;
        if (fieldA && fieldB) {
            for (i = 0; i < fieldA.length; i++) {
                const sa = fieldA[i];
                const sb = fieldB[i];

                if ((sa && sb) && (sa !== sb)) {
                    const p = `   ::: Change in field ${i + 1} (${fields[i].desc}),\n` +
                        `   ::: WAS "${sa}"\n   ::: NOW "${sb}"\n`;
                    result = result + p;
                }
            }
        }
        return result;
    }

    return "";
};

const diff = (a: IHl7Event, b: IHl7Event) => {
    const pid = fieldDiff(pidDef.PID.fields, b.pidLine, b.pidLine);
    const pv1 = fieldDiff(pv1Def.PV1.fields, a.pv1Line, b.pv1Line);
    const pv2 = fieldDiff(pv2Def.PV2.fields, a.pv2Line, b.pv2Line);
    const pd1 = fieldDiff(pd1Def.PD1.fields, a.pd1Line, b.pd1Line);
    if (pid) {
        console.log(`>> PID change:\n${pid}`);
    }
    if (pv1) {
        console.log(`>> PV1 change:\n${pv1}`);
    }
    if (pv2) {
        console.log(`>> PV2 change:\n${pv2}`);
    }
    if (pd1) {
        console.log(`PD1 change:\n${pd1}`);
    }
};

const args = process.argv;
let path = "";

if (args.length > 2) {
    const myArgs = args.slice(2);
    if (myArgs.length > 0) {
        path = myArgs[0];
    } else {
        throw new Error("HL7 Stream Path is missing");
    }
}

const lr = lineReader.createInterface({
    input: require("fs").createReadStream(path),
});

let setCount = 0;
const maxCount = 10000;
let message: IHl7Event = {} as IHl7Event;
const messages: IHl7Event[] = [];
let allDone = false;
let minTime = new Date("2118-1-1");
let maxTime = new Date("1970-1-1");
let prevRow: IHl7Event | null = null;
//
// ON CLOSE - Generate A Report
//
lr.on("close", () => {
    console.log(`${messages.length} events. All done! ${minTime} to ${maxTime}`);
    let a04 = 0;
    let a08 = 0;
    let a11 = 0;
    let a41 = 0;

    const pm: Map<string, IHl7Event[]> = new Map();

    _.forEach<IHl7Event>((m) => {
        if (m.eventType === "A04") {
            a04++;

            if (m.pid) {
                const mrn = m.pid![2][0];
                if (!pm.has(mrn)) {
                    pm.set(mrn, [m]);
                }
                // const fin = m.pid[17][0];
                // const pn = m.pid[4][0];
                //    console.log(`A04: ${mrn} ${fin} ${pn}`);
            }
        }
        if (m.eventType === "A08") {
            a08++;
            if (m.pid) {
                const mrn = m.pid[2][0];
                if (!pm.has(mrn)) {
                    pm.set(mrn, [m]);
                } else {
                    pm.get(mrn)!.push(m);
                }
            }
        }
        if (m.eventType === "A11") {
            a11++;
            if (m.pid) {
                const mrn = m.pid[2][0];
                if (!pm.has(mrn)) {
                    pm.set(mrn, [m]);
                } else {
                    pm.get(mrn)!.push(m);
                }
            }
        }
        if (m.eventType === "A41") {
            if (m.pid) {
                const mrn = m.pid[2][0];
                if (!pm.has(mrn)) {
                    pm.set(mrn, [m]);
                } else {
                    pm.get(mrn)!.push(m);
                }
            }
            a41++;
        }
    })(messages);
    console.log(`A04: ${a04}, A08: ${a08}, A11: ${a11}, A41: ${a41}`);
    const keyCount = pm.size;
    console.log(`${keyCount} patients`);

    for (const k of pm.keys()) {
        console.log("\n==== NEW PATIENT VISIT ======================================");
        const values = pm.get(k);
        prevRow = null;
        values!.forEach((v) => {
            console.log(`** NEW ${v.eventType} EVENT on ${v.eventTime.toLocaleTimeString()}, FOR MRN: ${k}**`);
            if (prevRow) {
                diff(prevRow, v);
            } else {
                hl7Dump(v);
            }
            prevRow = v;
        });
    }
    allDone = true;
});

lr.on("line", (line: string) => {
    //  console.log("Line from file:", line);
    if (setCount > maxCount) {
        // console.log(`Max ${messages.length} events processed. Finishing`);
        allDone = true;
    } else {
        const fields = line.split("|");
        if (fields[0] === "MSH") {
            setCount++;
        } else {
            const head = fields[0];
            if (head === "EVN") {
                setCount++;
                // const js = JSON.stringify(message, null, 3);
                message = {} as IHl7Event;
                messages.push(message);
                message.eventType = fields[1];
                message.obxLines = [];
                const t = fields[2];
                const y = t.substr(0, 4);
                // 20190325065648
                // 01234567890123
                const m = t.substr(4, 2);
                const d = t.substr(6, 2);
                const h = t.substr(8, 2);
                const mm = t.substr(10, 2);
                const s = t.substr(12, 2);
                const ts = `${m}/${d}/${y} ${h}:${mm}:${s}`;
                const dt: Date = new Date(ts);
                if (dt < minTime) {
                    minTime = dt;
                }
                if (dt > maxTime) {
                    maxTime = dt;
                }
                message.eventTime = dt;
            } else {
                fields.shift();
                const x = _.map((f: string) => {
                    return f.split("^");
                })(fields);
                switch (head) {
                    case "PID":
                        message.pid = x;
                        message.pidLine = line;
                        break;
                    case "PV1":
                        message.pv1Line = line;
                        break;
                    case "PV2":
                        message.pv2Line = line;
                        break;
                    case "PD1":
                        message.pd1Line = line;
                        break;
                    case "OBX":
                        message.obxLines.push(line);
                        break;
                    default:
                        break;
                }
            }
        }
    }
});

(function wait() {
    if (!allDone) {
        setTimeout(wait, 1000);
    }
})();
