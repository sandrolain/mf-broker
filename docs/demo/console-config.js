const $consoleCnt = document.createElement("ul");
$consoleCnt.setAttribute("id", "console");
document.body.appendChild($consoleCnt);
// eslint-disable-next-line no-undef
ConsoleLogHTML.connect($consoleCnt, null, true, true, false);
