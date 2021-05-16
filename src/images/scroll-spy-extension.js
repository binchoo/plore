class MarkdownTree {
	constructor(dom, depth) {
		this.dom = dom;
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
			const ul = SpyMenuElementHelper.getUL();
			this.child.forEach(child => {
				ul.appendChild(child.asElement())
			});
			ul.classList.add("menu-list");
			return ul;
		} else {
			const li = SpyMenuElementHelper.getLI(this.dom);
			const ul = SpyMenuElementHelper.getUL();
			if (this.child.length > 0) {
				li.appendChild(ul);
				this.child.forEach(child => {
					ul.appendChild(child.asElement())
				});
			}
			return li;
		}
	}
}

class SpyMenuElementHelper {
	static getUL() {
		return document.createElement("ul");
	}
	static getLI(dom) {
		const li = document.createElement("li");
		li.appendChild(this.getA(dom));
		return li;
	}
	static getA(dom) {
		const textContent = dom.textContent
		const hash = Math.floor(Math.random() * 1000);
		const a = document.createElement("a");

		dom.id = textContent + "(" + hash.toString() + ")";

		a.href = "#" + dom.id
		a.innerText = textContent
		return a;
	}
}

function getStructuredHTML(tagsOrdered) {
	console.assert(tagsOrdered.length > 0);

	const {
		doms,
		hierarchyTable
	} = parseDomHierarchy(tagsOrdered);
	const tree = new MarkdownTree(document, -1);

	buildMarkdownTree(doms, hierarchyTable, 0, tree);
	return tree.asElement();
}

function parseDomHierarchy(tagsOrdered) {
	const query = tagsOrdered.map(tag => "#content " + tag).join(",")
	const doms = document.querySelectorAll(query);
	const hierarchyTable = new Map();

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

	if (index == 0 || itsDepth > tree.depth) {
		const newTree = new MarkdownTree(it, itsDepth);
		tree.addChild(newTree);
		buildMarkdownTree(doms, hierarchyTable, index + 1, newTree);
	} else {
		buildMarkdownTree(doms, hierarchyTable, index, tree.parent);
	}
}