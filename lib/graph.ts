import { Builder } from "./builder.ts";
import { crayon, sprintf, toFileUrl } from "./deps.ts";
import { Entrypoint } from "./entrypoint.ts";
import { FileBag } from "./sources/fileBag.ts";
import { createGraph } from "./graph/createGraph.ts";
import { createLoader } from "./graph/load.ts";
import { createResolver } from "./graph/resolve.ts";

export async function buildModuleGraph(
  builder: Builder,
  sources: FileBag,
  entrypoint: Entrypoint,
) {
  const bareSpecifiers = new Map<string, string>();
  const target = entrypoint.config!.target;
  const load = createLoader(sources, target);

  const resolve = createResolver(
    builder.importMap,
    sources,
    bareSpecifiers,
    toFileUrl(builder.context.root),
  );

  const graph = await createGraph(
    entrypoint.url().href,
    (specifier) => {
      builder.log.debug(sprintf("%s %s", crayon.red("Load"), specifier));
      return load(specifier);
    },
    (specifier, referrer) => {
      builder.log.debug(
        sprintf(
          "%s %s from %s",
          crayon.lightBlue("Resolve"),
          specifier,
          referrer,
        ),
      );

      const resolved = resolve(specifier, referrer);

      builder.log.debug(
        sprintf(
          "%s %s to %s",
          crayon.green("Resolved"),
          specifier,
          resolved,
        ),
      );

      return resolved;
    },
  );

  entrypoint.setBareImportSpecifiers(bareSpecifiers);

  return graph;
}
