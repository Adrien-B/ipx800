/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Api {
  ip: string;
  key: string;
  version: "v4" | "v5";
  pollInterval: number;
  webhookPort: number;
  webhookPath: string;
}
