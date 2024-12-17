if (!window.frameElement && window.location.protocol !== 'file:') {
  // navigates to docs if direct access to the page html, e.g.
  //    https://hostname/docs/api/base/PhyicsControls#step
  // -> https://hostname/docs/#api/base/PhyicsControls.step

  const url = new URL(window.location.href);

  // hash route, e.g. #api/base/PhyicsControls.step
  url.hash = url.pathname.replace(/\/docs\/(.*?)(?:\.html)?$/, '$1') + url.hash.replace('#', '.');

  // docs home, e.g. https://hostname/docs/
  url.pathname = url.pathname.replace(/(\/docs\/).*$/, '$1');

  window.location.replace(url);
} else {
  document.addEventListener('DOMContentLoaded', onDocumentLoad, { once: true });
}

function onDocumentLoad() {
  const path = window.location.pathname;
  const name = /[\-A-Za-z0-9]+\.html/.exec(path).toString().split('.html')[0].replace(/-/g, ' ');

  let text = document.body.innerHTML;

  text = text.replace(/\[name\]/gi, name);
  text = text.replace(/\[path\]/gi, path);

  text = text.replace(/\[page:([\w\.]+)\]/gi, '[page:$1 $1]'); // [page:name] to [page:name title]
  text = text.replace(/\[page:\.([\w\.]+) ([\w\.\s]+)\]/gi, `[page:${name}.$1 $2]`); // [page:.member title] to [page:name.member title]
  text = text.replace(/\[page:([\w\.]+) ([\w\.\s]+)\]/gi, "<a class='links' data-fragment='$1' title='$1'>$2</a>"); // [page:name title]

  text = text.replace(/\[(member|property|method|param):([\w]+)\]/gi, '[$1:$2 $2]'); // [member:name] to [member:name title]
  text = text.replace(
    /\[(?:member|property|method):([\w]+) ([\w\.\s]+)\]\s*(\([\s\S]*?\))?/gi,
    `<a class='permalink links' data-fragment='${name}.$2' target='_parent' title='${name}.$2'>#</a> .<a class='links' data-fragment='${name}.$2' id='$2'>$2</a> $3 : <a class='param links' data-fragment='$1'>$1</a>`,
  );
  text = text.replace(/\[param:([\w\.]+) ([\w\.\s]+)\]/gi, "$2 : <a class='param links' data-fragment='$1'>$1</a>"); // [param:name title]

  text = text.replace(/\[link:([\w\:\/\.\-\_\(\)\?\#\=\!\~]+)\]/gi, '<a href="$1" target="_blank">$1</a>'); // [link:url]
  text = text.replace(/\[link:([\w:/.\-_()?#=!~]+) ([\w\p{L}:/.\-_'\s]+)\]/giu, '<a href="$1" target="_blank">$2</a>'); // [link:url title]
  text = text.replace(
    /\*([\u4e00-\u9fa5\w\d\-\(\"\（\“][\u4e00-\u9fa5\w\d\ \/\+\-\(\)\=\,\.\（\）\，\。"]*[\u4e00-\u9fa5\w\d\"\)\”\）]|\w)\*/gi,
    '<strong>$1</strong>',
  ); // *text*
  text = text.replace(/\`(.*?)\`/gs, '<code class="inline">$1</code>'); // `code`

  text = text.replace(/\[example:([\w\_]+)\]/gi, '[example:$1 $1]'); // [example:name] to [example:name title]
  text = text.replace(
    /\[example:([\w\_]+) ([\w\:\/\.\-\_ \s]+)\]/gi,
    '<a href="../examples/#$1" target="_blank">$2</a>',
  ); // [example:name title]

  text = text.replace(
    /<a class=\'param links\' data-fragment=\'\w+\'>(undefined|null|this|Boolean|Object|Array|Number|String|Integer|Float|TypedArray|ArrayBuffer)<\/a>/gi,
    '<span class="param">$1</span>',
  ); // remove links to primitive types

  document.body.innerHTML = text;

  // update links.href

  if (window.parent.getPageURL) {
    const links = document.querySelectorAll('.links');
    for (let i = 0; i < links.length; i++) {
      const pageURL = window.parent.getPageURL(links[i].dataset.fragment);
      if (pageURL) {
        links[i].href = './index.html#' + pageURL;
      }
    }
  }

  // handle links

  document.body.addEventListener('click', event => {
    const element = event.target;
    if (
      element.classList.contains('links') &&
      event.button === 0 &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      window.parent.setUrlFragment(element.dataset.fragment);
      event.preventDefault();
    }
  });

  // handle code snippets formatting

  function dedent(text) {
    // ignores single line code
    const lines = text.split('\n');
    if (lines.length <= 1) return text;

    // ignores blank line code
    const nonBlankFirstLine = lines.filter(line => line.trim())[0];
    if (nonBlankFirstLine === undefined) return text;

    // strips indents if any
    const m = nonBlankFirstLine.match(/^([\t ]+)/);
    if (m) text = lines.map(l => (l.startsWith(m[1]) ? l.substring(m[1].length) : l)).join('\n');

    // strips leading and trailing whitespaces finally
    return text.trim();
  }

  // create copy button for copying code snippets

  function addCopyButton(element) {
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-btn';

    element.appendChild(copyButton);

    copyButton.addEventListener('click', function () {
      const codeContent = element.textContent;
      navigator.clipboard.writeText(codeContent).then(() => {
        copyButton.classList.add('copied');

        setTimeout(() => {
          copyButton.classList.remove('copied');
        }, 1000);
      });
    });
  }

  const codeElements = document.getElementsByTagName('code');

  for (let i = 0; i < codeElements.length; i++) {
    const element = codeElements[i];

    element.textContent = dedent(element.textContent);

    if (!element.classList.contains('inline')) {
      addCopyButton(element);
    }
  }

  // Code syntax highlighting

  const styleBase = document.createElement('link');
  styleBase.href = '../prettify/prettify.css';
  styleBase.rel = 'stylesheet';

  const styleCustom = document.createElement('link');
  styleCustom.href = '../prettify/threejs.css';
  styleCustom.rel = 'stylesheet';

  document.head.appendChild(styleBase);
  document.head.appendChild(styleCustom);

  const prettify = document.createElement('script');
  prettify.src = '../prettify/prettify.js';

  prettify.onload = function () {
    for (let i = 0; i < codeElements.length; i++) {
      const code = codeElements[i];
      code.currentStyle = { whiteSpace: 'pre-wrap' }; // Workaround for Firefox, see #30008
      code.className += ' prettyprint';
      code.setAttribute('translate', 'no');
    }
  };

  document.head.appendChild(prettify);

  // Edit button

  const editButton = document.createElement('div');
  editButton.className = 'edit-btn';
  editButton.addEventListener(
    'click',
    function () {
      window.open('https://github.com/byongho96/three-game-controls/tree/master/public' + path);
    },
    false,
  );

  document.body.appendChild(editButton);
}
