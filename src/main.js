import "./style.css";
import Split from "split-grid";
import { encode, decode } from "js-base64";
import * as monaco from "monaco-editor";
import Htmlworker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import Cssworker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import Jsworker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "html") return new Htmlworker();
    if (label === "css") return new Cssworker();
    if (label === "javascript") return new Jsworker();
  },
};

Split({
  columnGutters: [
    {
      track: 1,
      element: document.querySelector(".vertical-gutter"),
    },
  ],
  rowGutters: [
    {
      track: 1,
      element: document.querySelector(".horizontal-gutter"),
    },
  ],
});

const $ = (selector) => document.querySelector(selector);

const $js = $("#js");
const $css = $("#css");
const $html = $("#html");

const { pathname } = window.location;

const [rawHtml, rawCss, rawJs] = pathname.slice(1).split("%7C");

const html = decode(rawHtml);
const css = decode(rawCss);
const js = decode(rawJs);

const htmlForPreview = createHtml({ html, js, css });
$("iframe").setAttribute("srcdoc", htmlForPreview);

const htmlEditor = monaco.editor.create($html, {
  value: html,
  language: "html",
  fontSize: 18,
  theme: "vs-dark",
});

const cssEditor = monaco.editor.create($css, {
  value: css,
  language: "css",
  fontSize: 18,
  theme: "vs-dark",
});

const jsEditor = monaco.editor.create($js, {
  value: js,
  language: "javascript",
  fontSize: 18,
  theme: "vs-dark",
});

htmlEditor.onDidChangeModelContent(update);
cssEditor.onDidChangeModelContent(update);
jsEditor.onDidChangeModelContent(update);

function update() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;

  window.history.replaceState(null, null, `/${hashedCode}`);

  const htmlForPreview = createHtml({ html, js, css });
  $("iframe").setAttribute("srcdoc", htmlForPreview);
}

function createHtml({ html, js, css }) {
  return `
    <!doctype html>
    <html lang="en">
     <head>
       <style>
        ${css}
        </style>
      </head>
    <body>
        ${html}
    <script>
        ${js}
    </script>
    </body>
    </html>
    `;
}
