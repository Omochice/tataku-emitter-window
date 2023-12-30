import { Denops } from "https://deno.land/x/denops_std@v5.2.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.2.0/function/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v5.2.0/helper/mod.ts";
import {
  assert,
  is,
  PredicateType,
} from "https://deno.land/x/unknownutil@v3.11.0/mod.ts";

const isOption = is.ObjectOf({
  cmd: is.String,
});

type Option = PredicateType<typeof isOption>;

const defaultOption: Option = {
  cmd: "enew",
};

const prepareWindow = async (denops: Denops, cmd: string): Promise<number> => {
  await execute(denops, cmd);
  const bufnr = await fn.bufnr(denops);
  await fn.setbufvar(denops, bufnr, "&buftype", "nofile");
  return bufnr;
};

const emitter = (denops: Denops, option = defaultOption) => {
  assert(option, isOption);
  const state = { isPrepared: false, bufnr: -1 };
  return new WritableStream<string[]>({
    write: async (chunk: string[]) => {
      if (!state.isPrepared) {
        state.bufnr = await prepareWindow(
          denops,
          option?.cmd ?? defaultOption.cmd,
        );
        state.isPrepared = true;
      }
      const linenr = await fn.line(denops, "$") - 1;
      const lastLine = await fn.getbufline(denops, state.bufnr, linenr);
      const [currentLine, ...newLines] = chunk.join("").split(/\r?\n/);

      await fn.setbufline(
        denops,
        state.bufnr,
        linenr,
        lastLine + currentLine,
      );
      if (newLines.length > 0) {
        await fn.appendbufline(
          denops,
          state.bufnr,
          linenr,
          newLines,
        );
      }
    },
  });
};

export default emitter;
