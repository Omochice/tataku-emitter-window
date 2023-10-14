import { Denops } from "https://deno.land/x/denops_std@v3.8.1/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.8.1/function/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v3.8.1/helper/mod.ts";
import {
  assert,
  is,
  PredicateType,
} from "https://deno.land/x/unknownutil@v3.9.0/mod.ts";

const isOption = is.ObjectOf({
  cmd: is.String,
});

type Option = PredicateType<typeof isOption>;

const defaultOption: Option = {
  cmd: "enew",
};

const emitter = (denops: Denops, option = defaultOption) => {
  assert(option, isOption);
  return new WritableStream<string[]>({
    write: async (chunk: string[]) => {
      await execute(denops, option?.cmd ?? defaultOption.cmd);
      const bufnr = await fn.bufnr(denops);
      await fn.setbufvar(denops, bufnr, "&buftype", "nofile");
      await fn.setbufline(denops, bufnr, 1, chunk);
    },
  });
};

export default emitter;
