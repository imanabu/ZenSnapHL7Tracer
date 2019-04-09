# ZenSnapMD HL7 Tracer

## What It Does

Given a raw HL7 file, it can trace the changes in HL7 per patient, as keyed by the MRN field
and report on any new HL7 events and differences.

For this version, Only PID, PV1, PV2, and PD1 are covered but others can be easily enabled.
OBX segments are also omitted for this version but also can be easily enabled on your own.

It also support A04, A08 events, but you can extend it to support others.

## Installing and Running

This is a Node.js and Express with Typescript based code base but it is a command-line app and not a web app.
Use the standard Node.js and NPM build steps.

    npm install
    npm build
    node app.js Your-hl7stream.txt

## Example

This example shows various A04 and A8 events and various changes that occurred to a patient. A stream file
can have as many events as a memory can hold, easily a few GB of HL7 raw messages.

    ==== NEW PATIENT VISIT ======================================
    ** NEW A04 EVENT on 7:52:05 AM, FOR MRN: 12345678**
    ++ PID Segment ++
       PID-1: 1 [Set ID – Patient ID]
       PID-2: 12345678^^^MRN^MRN [Patient ID (External ID)]
       PID-3: 12345678^^^MRN^MRN [Patient ID (Internal ID)]
       PID-4: 12345678^0^^MRN^Account Number~12345678^0^^MRN^Account Number~12345678^[Alternate Patient ID – PID]
       PID-5: MATSUDA^MIYAO^^^^^Current [Patient Name]
       PID-7: 20130809 [Date/Time of Birth]
       PID-8: M [Sex]
       PID-10: 1 [Race]
       PID-11: 1234 N. MAIN ST.^^FULL MOON BAY^CA^12345-9999^USA^HOME^^001~m.matsuda@zensnapmd.com^^^^^^E-mail [Patient Address]
       PID-13: (650) 762-8413^Home^Tel~(650) 762-8413 mom^Alternate~(650) 762-8413^Pager personal [Phone Number – Home]
       PID-15: EN [Primary Language]
       PID-16: S [Marital Status]
       PID-17: 08 [Religion]
       PID-18: 9998887776^^^FIN^FIN NBR [Patient Account Number]
       PID-19: 999-99-9999 [SSN Number – Patient]
       PID-22: 1 [Ethnic Group]
       PID-25: 0 [Birth Order]
    ++ PV1 Segment ++
       PV1-1: 1 [Set ID – PV1]
       PV1-2: O [undefined]
       PV1-3: FMBHC Hematology \T\^^^Hem/Onc^^Ambulatory(s)^Hematology \T\ Onc [Assigned Patient Location]
       PV1-4: EL [Admission Type]
       PV1-6: FMBHC Hematology \T\^^^Hem/Onc^^^Hematology \T\ Onc [Prior Patient Location]
       PV1-7: 9999^Tokunaga^Amy^K [Attending Doctor]
       PV1-8: 9999^Tokunaga^Amy^K [Referring Doctor]
       PV1-10: HC [Hospital Service]
       PV1-14: Clinic or Physician Office Referral [Admit Source]
       PV1-17: 9999^Tokunaga^Amy^K [Admitting Doctor]
       PV1-18: D [Patient Type]
       PV1-20: BB [Financial Class]
       PV1-39: Hem/Onc [Servicing Facility]
       PV1-41: A [Account Status]
       PV1-44: 20190325075205 [Admit Date/Time]
    ++ PV2 Segment ++
       PV2-3: ^CBC W/DIFF, P8, LFT, LDH, MG, PHOS, UA, AVASTIN [Admit Reason]
       PV2-8: 20190325080000 [Expected Admit Date/Time]
       PV2-10: 0 [Estimated Length of Inpatient Stay]
       PV2-13: F [Referral Source Code]
       PV2-21: Yes [Visit Publicity Code]
       PV2-22: Routine [Visit Protection Indicator]
       PV2-23: ^^89898989 [Clinic Organization Name]
    ++ PD1 Segment ++
       PD1-4: 9876^Suzuki^Tommy^E^MD [Patient Primary Care Provider Name & ID No.]
    ** NEW A08 EVENT on 8:15:33 AM, FOR MRN: 12345678**
    >> PV1 change:
       ::: Change in field 7 (Attending Doctor),
       ::: WAS "9999^Tokunaga^Amy^K"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 8 (Referring Doctor),
       ::: WAS "9999^Tokunaga^Amy^K"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 17 (Admitting Doctor),
       ::: WAS "9999^Tokunaga^Amy^K"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 44 (Admit Date/Time),
       ::: WAS "20190325075205"
       ::: NOW "20190325081439"
    
    ** NEW A08 EVENT on 8:20:57 AM, FOR MRN: 12345678**
    >> PV1 change:
       ::: Change in field 7 (Attending Doctor),
       ::: WAS "9988^Honda^Fuyuko"
       ::: NOW "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: Change in field 8 (Referring Doctor),
       ::: WAS "9988^Honda^Fuyuko"
       ::: NOW "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: Change in field 17 (Admitting Doctor),
       ::: WAS "9988^Honda^Fuyuko"
       ::: NOW "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: Change in field 44 (Admit Date/Time),
       ::: WAS "20190325081439"
       ::: NOW "20190325081944"
    
    ** NEW A08 EVENT on 8:21:10 AM, FOR MRN: 12345678**
    >> PV1 change:
       ::: Change in field 7 (Attending Doctor),
       ::: WAS "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 8 (Referring Doctor),
       ::: WAS "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 17 (Admitting Doctor),
       ::: WAS "8877^Toyoda^Mitsuko^R~8877^Toyoda^MitsukoR"
       ::: NOW "9988^Honda^Fuyuko"
       ::: Change in field 44 (Admit Date/Time),
       ::: WAS "20190325081944"
       ::: NOW "20190325081439"