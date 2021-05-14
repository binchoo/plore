function CreateAnchorListHTML(query) {
	var matches = document.querySelectorAll(query);
	var resultHtml = document.createElement("ul");
	resultHtml.classList.add("menu-list");
	var queue = [];
	var isH2 = false;
	var ul;
	for (var i = 0; i < matches.length; i++) {
		var hash = Math.floor(Math.random() * 1000);
		matches[i].id = matches[i].textContent + "(" + hash.toString() + ")";
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.href = "#" + matches[i].textContent + "(" + hash.toString() + ")";
		a.innerText = matches[i].textContent;
		li.appendChild(a);
		if (isH2 == false && matches[i].tagName == "H2") {
			ul = document.createElement("ul");
			ul.appendChild(li);
			isH2 = true;
		} else if (isH2 == true && matches[i].tagName != "H2") {
			isH2 = false;
			var tmp = queue.pop();
			tmp.appendChild(ul);
			queue.push(tmp);
			queue.push(li);
		} else if (isH2 == true) {
			ul.appendChild(li);
		} else if (isH2 == false && matches[i].tagName == "H1") {
			queue.push(li);
		}
	}
	while (queue.length > 0) {
		resultHtml.appendChild(queue.shift());
	}
	return resultHtml;
}

class MarkdownTree {
	constructor(textContent, depth) {
		this.textContent = textContent;
		this.depth = depth;
		this.child = [];
		this.parent = undefined;
	}
	addChild(child) {
		child.parent = this;
		this.child.push(child);
	}
	asElement() {
		if (this.depth == -1) { //루트 노드일 경우
			const ul = SpyMenuHtmlBuilder.getUL();
			this.child.forEach(child=> { ul.appendChild(child.asElement()) });
			ul.classList.add("menu-list");
			return ul;
		} else {
			const li = SpyMenuHtmlBuilder.getLI(this.textContent);
			const ul = SpyMenuHtmlBuilder.getUL();
			li.appendChild(ul);
			this.child.forEach(child=> { ul.appendChild(child.asElement()) });
			return li;
		}
	}
}

class SpyMenuHtmlBuilder {
	static getUL(asRoot) {
		return document.createElement("ul");
	}
	static getLI(textContent) {
		const li = document.createElement("li");
		li.appendChild(this.getA(textContent));
		return li;
	}
	static getA(textContent) {
		const hash = Math.floor(Math.random() * 1000);
		const a = document.createElement("a");
		a.href = "#" + textContent + "(" + hash.toString() + ")";
		a.innerText = textContent;
		return a;
	}
}

function getStructuredHTML(tagsOrdered) {
	console.assert(tagsOrdered.length > 0);

	const { doms, hierarchyTable } = parseDomHierarchy(tagsOrdered);
	const tree = new MarkdownTree("root", -1);

	buildMarkdownTree(doms, hierarchyTable, 0, tree);
	return tree.asElement();
}

function parseDomHierarchy(tagsOrdered) {
	let query = tagsOrdered.map(tag => "#content " + tag).join(",")
	let doms = document.querySelectorAll(query);
	let hierarchyTable = new Map();

	tagsOrdered.forEach((tag, index) => {
		hierarchyTable.set(tag.toUpperCase(), index);
	});

	return {
		doms: doms,
		hierarchyTable: hierarchyTable
	};
}

function buildMarkdownTree(doms, hierarchyTable, index, tree) {
	if (doms.length <= index) return;

	const it = doms[index];
	const itsDepth = hierarchyTable.get(it.tagName);

	if (index == 0 || itsDepth > tree.depth) { //뎁스가 더 깊을 때
		const newTree = new MarkdownTree(it.textContent, itsDepth);

		tree.addChild(newTree);
		console.log(tree.textContent + "->" + it.textContent);
		buildMarkdownTree(doms, hierarchyTable, index + 1, newTree);
	} else { //뎁스가 동위이거나 얕을 때
		buildMarkdownTree(doms, hierarchyTable, index, tree.parent);
	}
}