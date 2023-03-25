export interface Config {
  CATS_DYNAMO_TABLE?: string;
}

export default {
  ...process.env,
} as unknown as Config;
