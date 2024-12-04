let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

// 获取漫画列表
function loadComics() {
    const comicList = document.getElementById('comic-list');
    const comics = ['jie_mo_ren.pdf', 'xue_mo_ren.pdf']; // 替换为实际的漫画文件名

    comics.forEach(comic => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = comic.replace('.pdf', '');
        a.onclick = () => openComic(comic);
        li.appendChild(a);
        comicList.appendChild(li);
    });
}

// 打开漫画
async function openComic(url) {
    document.getElementById('comic-viewer').classList.remove('hidden');
    resetPdfViewer();
    await loadPdf(url);
    renderPage(pageNum);
}

// 关闭漫画
function closeComic() {
    document.getElementById('comic-viewer').classList.add('hidden');
    resetPdfViewer();
}

// 重置PDF查看器
function resetPdfViewer() {
    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
    const canvas = document.getElementById('pdf-canvas');
    canvas.width = 0;
    canvas.height = 0;
    document.getElementById('page-number').textContent = '第 1 页 / 共 0 页';
}

// 加载PDF文件
async function loadPdf(url) {
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    document.getElementById('page-number').textContent = `第 ${pageNum} 页 / 共 ${pdfDoc.numPages} 页`;
}

// 渲染指定页面
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.getElementById('pdf-canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
}

// 上一页
function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
    updatePageNumber();
}

// 下一页
function nextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
    updatePageNumber();
}

// 更新页码显示
function updatePageNumber() {
    if (pdfDoc) {
        document.getElementById('page-number').textContent = `第 ${pageNum} 页 / 共 ${pdfDoc.numPages} 页`;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadComics();
});
