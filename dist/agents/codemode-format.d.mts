//#region src/agents/codemode-format.d.ts
type CodemodeParseOutcome = {
  kind: "script";
  code: string;
  status?: string;
  prose?: string;
} | {
  kind: "multiple";
  feedback: string;
} | {
  kind: "malformed";
  feedback: string;
} | {
  kind: "none";
  prose?: string;
};
export declare function parseCodemodeResponse(content: string): CodemodeParseOutcome;
//#endregion
//# sourceMappingURL=codemode-format.d.mts.map