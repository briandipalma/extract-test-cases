export default function (file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression)
    .filter((path) => {
      const { callee } = path.value;

      if (j.Identifier.check(callee) && callee.name === "it") {
        return true;
      }
    })
    .forEach((path) => {
      console.log("");

      const args = path.value.arguments;
      const describe = getDescribe(path, j);

      // The test suite and name
      console.log(describe, args[0].value);

      args[1].body.body.forEach((v) => {
        v.comments?.forEach((c) => {
          const comment = c.value.trim();

          if (comment.match(/^(GIVEN|AND|WHEN|THEN)/)) console.log(comment);
        });
      });
    });

  console.log("");
}

function getDescribe(path, j) {
  let describe = "";

  while (path.parentPath) {
    if (
      j.CallExpression.check(path.value) &&
      j.Identifier.check(path.value.callee) &&
      path.value.callee?.name === "describe"
    ) {
      describe += path.value.arguments[0].value;
    }

    path = path.parentPath;
  }

  return describe;
}

export const parser = "ts";
