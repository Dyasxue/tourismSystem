// 获取元素
const openModalBtn = document.querySelectorAll('#open');//底边栏选项
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const mainContent = document.getElementById('main-content');
const modalcontent=document.querySelector('.modal-content');
const p=modal.querySelector('p');
const contents=[
    "<h1>From BUPT 北京邮电大学:</h1></br><h2>2023212872 计子毅<h2></br><h2>2023210710 陈子容<h2></br><h2>2023210826 陈墨涵</h2>",
    "2",
    "3",
    "4"
];

// 打开模态窗口
for(let i=0;i<4;i++){
    openModalBtn[i].addEventListener('click', () => {
        switch(i){
           case 0:
            p.style="line-height:50px";
            modalcontent.style.background="url('./images/photo-1740648392577-aa23127ef90e.avif')"
            break;
           case 1:
            p.style="line-height:600px";
            modalcontent.style.background="url('./images/scene-bg-x.6a1a9834.png')"
            break;
           case 2:
            p.style="line-height:10px";
            modalcontent.style.background="url('./images/scene-bg-x.6a1a9834.png')"
            break;
           case 3:
            p.style="line-height:1px";
            modalcontent.style.background="url('./images/scene-bg-x.6a1a9834.png')"
            break;
           default:
        }
        p.innerHTML=contents[i];
        modal.style.display = 'flex'; // 显示模态窗口
        mainContent.classList.add('blur'); // 模糊原界面
    });
}

// 关闭模态窗口
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none'; // 隐藏模态窗口
    mainContent.classList.remove('blur'); // 取消模糊
});

// 点击模态窗口外部关闭窗口
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // 隐藏模态窗口
        mainContent.classList.remove('blur'); // 取消模糊
    }
});