import { c as ProcessorState, n as DefinedProcessorContract } from "./contract-D1J6d08G.mjs";
import { z } from "zod";
//#region src/email.d.ts
export declare const EmailContract: DefinedProcessorContract<z.ZodObject<{
  threads: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
    subject: z.ZodString;
    messageOffsets: z.ZodArray<z.ZodNumber>;
  }, z.core.$strip>>>;
  threadOffsetByMessageId: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>, {
  readonly "events.iterate.com/email/received": {
    readonly description: "A message arrived at one of the project's addresses (platform fact, keyed by its Message-ID).";
    readonly payloadSchema: z.ZodObject<{
      messageId: z.ZodNullable<z.ZodString>;
      from: z.ZodString;
      to: z.ZodArray<z.ZodString>;
      cc: z.ZodArray<z.ZodString>;
      subject: z.ZodString;
      text: z.ZodNullable<z.ZodString>;
      html: z.ZodNullable<z.ZodString>;
      inReplyTo: z.ZodNullable<z.ZodString>;
      references: z.ZodArray<z.ZodString>;
      attachments: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        contentType: z.ZodString;
        size: z.ZodNumber;
        path: z.ZodString;
      }, z.core.$strip>>;
      replyTo: z.ZodOptional<z.ZodString>;
      envelope: z.ZodObject<{
        from: z.ZodString;
        to: z.ZodString;
      }, z.core.$strip>;
      sender: z.ZodObject<{
        verified: z.ZodBoolean;
        member: z.ZodBoolean;
        direct: z.ZodBoolean;
      }, z.core.$strip>;
      automated: z.ZodBoolean;
      authentication: z.ZodObject<{
        spf: z.ZodNullable<z.ZodString>;
        dkim: z.ZodNullable<z.ZodString>;
        dmarc: z.ZodNullable<z.ZodString>;
      }, z.core.$strip>;
    }, z.core.$strip>;
  };
  readonly "events.iterate.com/email/sent": {
    readonly description: "The project sent a message through `itx.email.send` (platform fact).";
    readonly payloadSchema: z.ZodObject<{
      messageId: z.ZodNullable<z.ZodString>;
      from: z.ZodString;
      to: z.ZodArray<z.ZodString>;
      cc: z.ZodArray<z.ZodString>;
      subject: z.ZodString;
      text: z.ZodNullable<z.ZodString>;
      html: z.ZodNullable<z.ZodString>;
      inReplyTo: z.ZodNullable<z.ZodString>;
      references: z.ZodArray<z.ZodString>;
      attachments: z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        contentType: z.ZodString;
        size: z.ZodNumber;
        path: z.ZodString;
      }, z.core.$strip>>;
    }, z.core.$strip>;
  };
}, readonly ["events.iterate.com/email/received", "events.iterate.com/email/sent"], readonly [], readonly []>;
/** The reduced threads (the contract's `stateSchema`). */
export type EmailState = ProcessorState<typeof EmailContract>;
//#endregion
//# sourceMappingURL=email.d.mts.map