// 获取元素
const openModalBtn = document.querySelectorAll('#open');//底边栏选项
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const mainContent = document.getElementById('main-content');
const modalcontent=document.querySelector('.modal-content');
const p=modal.querySelector('p');
const contents=[
    "<h1>From BUPT 北京邮电大学:</h1></br><h2>2023212872 计子毅<h2></br><h2>2023210710 陈子容<h2></br><h2>2023210826 陈墨涵</h2>",
    "问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br></br>问:如何使用?</br></br>A:请查看<a href='#'>帮助文档</a></br></br>",
    "<div class='feedback-box'><div class='feedback-title'>用户问题反馈</div><div class='input-group'><label for='name'>姓名：</label><input type='text' id='name' placeholder='请输入您的姓名'></div><div class='input-group'><label for='email'>邮箱：</label><input type='email' id='email' placeholder='请输入您的邮箱'></div><div class='input-group'><label for='message'>问题描述：</label><textarea id='message' placeholder='请详细描述您的问题'></textarea></div><button class='submit-button'>提交反馈</button></div>",
    "<b>版本号：</b>测试版</br><b>生效日期：</b>2025年6月1日</br></br>欢迎使用“个性化旅游系统”（以下简称“本系统”）。本系统由北京邮电大学课程学生团队开发，旨在为用户提供个性化的旅游推荐、路线规划、场所查询及旅游日记管理等功能。在您使用本系统之前，请仔细阅读并理解本用户协议（以下简称“协议”）。通过使用本系统，您同意遵守本协议的所有条款和条件。如果您不同意本协议的任何条款，请立即停止使用本系统。</br></br><h4>1. 用户权利与义务</h4></br>1.1 ​用户权利</br>您有权使用本系统提供的所有功能，包括但不限于旅游推荐、路线规划、场所查询、旅游日记管理等。</br>您有权根据个人需求进行个性化设置，如选择旅游目的地、规划旅游路线等。</br>您有权查看、编辑和删除您创建的旅游日记。</br></br>1.2 ​用户义务</br>您应确保在使用本系统时提供的所有信息真实、准确、完整。</br>您不得利用本系统进行任何非法活动或传播任何违法信息。</br>您不得未经授权访问、修改或破坏本系统的任何部分。</br>您应妥善保管您的账户信息，并对因账户信息泄露导致的任何后果负责。</br></br><h4>2. 系统功能与使用</h4></br>2.1 ​旅游推荐</br>本系统将根据您的兴趣、旅游热度和评价为您推荐旅游目的地。</br>您可以通过输入景点名称、类别或关键字进行查询，系统将根据热度和评价对查询结果进行排序。</br></br>2.2 ​旅游路线规划</br>您可以在进入景区或学校后，输入目标景点或场所信息，系统将为您规划最优旅游路线。</br>系统支持最短距离策略、最短时间策略及交通工具的最短时间策略。</br></br>2.3 ​场所查询</br>在景区或学校内部，您可以查询附近的服务设施，并根据距离进行排序。</br>您可以通过选择类别或输入类别名称进行查询。</br></br>2.4 ​旅游日记管理</br>您可以在旅游过程中或结束后撰写旅游日记，并通过文字、图片和视频等方式记录旅游内容。</br>您可以浏览和查询所有用户的旅游日记，并根据热度、评价和个人兴趣进行推荐。</br></br><h4>3. 数据隐私与安全</h4></br>3.1 ​数据收集</br>本系统将收集您提供的个人信息、旅游偏好及旅游日记等内容，以提供更好的服务。</br></br>3.2 ​数据使用</br>您的个人信息将仅用于本系统的功能实现和优化，不会未经授权向第三方披露。</br></br>3.3 ​数据安全</br>我们将采取合理的技术措施保护您的数据安全，但无法保证绝对的安全。</br></br><h4>4. 免责声明</h4></br>4.1 ​系统可用性</br>本系统将尽力保证服务的连续性和稳定性，但不对因不可抗力或技术故障导致的服务中断负责。</br></br>4.2 ​信息准确性</br>本系统提供的旅游推荐、路线规划等信息仅供参考，您应自行核实相关信息的准确性。</br></br>4.3 ​第三方服务</br>本系统可能包含第三方服务或链接，我们对第三方服务的内容、隐私政策或行为不承担任何责任。</br></br><h4>5. 协议修改与终止</h4></br>5.1 ​协议修改</br>我们保留随时修改本协议的权利，修改后的协议将在本系统内公布，并自公布之日起生效。</br></br>5.2 ​协议终止</br>您有权随时停止使用本系统。</br>我们有权在您违反本协议的情况下终止您的使用权限。</br></br><h4>6. 法律适用与争议解决</h4></br>6.1 ​法律适用</br>本协议的解释与适用均适用中华人民共和国法律。</br></br>6.2 ​争议解决</br>因本协议引起的或与本协议有关的任何争议，双方应通过友好协商解决；协商不成的，任何一方均可向北京邮电大学所在地有管辖权的人民法院提起诉讼。</br></br>7. 联系方式</br></br>如您对本协议或本系统有任何疑问，请联系：</br></br><b>联系人：</b>项目小组</br><b>Email：</b>XXX@bupt.edu.cn</br></br><b>感谢您使用“个性化旅游系统”！</b></br>"
];

// 打开模态窗口
for(let i=0;i<4;i++){
    openModalBtn[i].addEventListener('click', () => {
        switch(i){
           case 0:
            modalcontent.style="text-align:center;"
            p.style="line-height:50px; background-image:-webkit-linear-gradient(top,red,orange,rgb(0, 149, 255)); -webkit-background-clip:text;  -webkit-text-fill-color:transparent;";
            modalcontent.style.background="url('./images/photo-1740648392577-aa23127ef90e.avif')"
            break;
           case 1:
            modalcontent.style="text-align:left; padding:0 10px"
            p.style="font-size:20px;line-height:19.2px;font-family:华文行楷;"
            break;
           case 2:
            modalcontent.style="text-align:left; padding-left:10px"
            p.style="";
            break;
           case 3:
            modalcontent.style="text-align:left; padding:0 10px"
            p.style="line-height:19.2px;"
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